/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (C) 2026 Wesley Cordeiro de Araujo
 * See NOTICE for additional attribution and origin notices.
 */


import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import {
  findOrCreateOfflineLocation,
  saveOfflineDemand
} from '../../db/offlineQueue';
import type {
  DemandPriority,
  ReliefLocationType
} from '../../db/localTypes';
import { useI18n } from '../../i18n/I18nProvider';
import { getCurrentBrowserPosition } from '../../shared/utils/geolocation';
import {
  demandLocationTypes,
  demandPriorityOptions,
  unitOptions
} from '../forms/emergencyFormOptions';
import { createClientId } from '../../db/deviceIdentity';

type DemandFlowModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type DemandFormItem = {
  id: string;
  medicineName: string;
  medicineCode: string;
  requestedQuantity: string;
  unit: string;
  priority: DemandPriority;
  patientGroup: string;
  notes: string;
};

function createEmptyDemandItem(): DemandFormItem {
  return {
    id: createClientId(),
    medicineName: '',
    medicineCode: '',
    requestedQuantity: '',
    unit: 'caixas',
    priority: 'Critical',
    patientGroup: '',
    notes: ''
  };
}

function parseNullableNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(',', '.'));

  return Number.isFinite(parsed) ? parsed : null;
}

function parseQuantity(value: string): number {
  return Number(value.replace(',', '.'));
}

export function DemandFlowModal({ isOpen, onClose }: DemandFlowModalProps) {
  const { t } = useI18n();

  const [locationName, setLocationName] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [locationType, setLocationType] =
    useState<ReliefLocationType>('Hospital');
  const [area, setArea] = useState('');
  const [contactAlias, setContactAlias] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationNotes, setLocationNotes] = useState('');

  const [items, setItems] = useState<DemandFormItem[]>([
    createEmptyDemandItem()
  ]);

  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [showItemDetails, setShowItemDetails] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const validItems = useMemo(() => {
    return items.filter((item) => {
      return (
        item.medicineName.trim().length > 0 &&
        parseQuantity(item.requestedQuantity) > 0 &&
        item.unit.trim().length > 0
      );
    });
  }, [items]);

  if (!isOpen) {
    return null;
  }

  function updateItem(
    id: string,
    field: keyof DemandFormItem,
    value: string
  ): void {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  }

  function updatePriority(id: string, value: DemandPriority): void {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              priority: value
            }
          : item
      )
    );
  }

  function addItem(): void {
    setItems((current) => [...current, createEmptyDemandItem()]);
  }

  function removeItem(id: string): void {
    setItems((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function resetForm(): void {
    setLocationName('');
    setLocationCode('');
    setLocationType('Hospital');
    setArea('');
    setContactAlias('');
    setContactName('');
    setContactPhone('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setLocationNotes('');
    setItems([createEmptyDemandItem()]);
    setShowLocationDetails(false);
    setShowItemDetails(false);
    setError(null);
    setGeoMessage(null);
    setSuccessMessage(null);
  }

  function handleClose(): void {
    resetForm();
    onClose();
  }

  async function handleUseCurrentLocation(): Promise<void> {
    setGeoMessage(null);
    setError(null);
    setIsGettingLocation(true);

    try {
      const position = await getCurrentBrowserPosition();

      setLatitude(String(Number(position.latitude.toFixed(6))));
      setLongitude(String(Number(position.longitude.toFixed(6))));
      setGeoMessage(t('location.geoSuccess'));
      setShowLocationDetails(true);
    } catch {
      setGeoMessage(t('location.geoFail'));
    } finally {
      setIsGettingLocation(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccessMessage(null);

    if (locationName.trim().length < 2) {
      setError(t('demand.requiredLocation'));
      return;
    }

    if (validItems.length === 0) {
      setError(t('demand.requiredItem'));
      return;
    }

    const parsedLatitude = parseNullableNumber(latitude);
    const parsedLongitude = parseNullableNumber(longitude);

    if (parsedLatitude !== null && (parsedLatitude < -90 || parsedLatitude > 90)) {
      setError(t('demand.invalidLatitude'));
      return;
    }

    if (
      parsedLongitude !== null &&
      (parsedLongitude < -180 || parsedLongitude > 180)
    ) {
      setError(t('demand.invalidLongitude'));
      return;
    }

    setIsSaving(true);

    try {
      const location = await findOrCreateOfflineLocation({
        name: locationName,
        code: locationCode,
        type: locationType,
        area,
        contactAlias,
        contactName,
        contactPhone,
        address,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        notes: locationNotes
      });

      for (const item of validItems) {
        await saveOfflineDemand({
          locationClientOperationId: location.clientOperationId,
          medicineName: item.medicineName,
          medicineCode: item.medicineCode,
          requestedQuantity: parseQuantity(item.requestedQuantity),
          unit: item.unit,
          priority: item.priority,
          patientGroup: item.patientGroup,
          notes: item.notes
        });
      }

      setSuccessMessage(
        t('demand.saveSuccess', {
          count: validItems.length,
          location: location.name
        })
      );

      setItems([createEmptyDemandItem()]);
      setShowItemDetails(false);
    } catch {
      setError(t('demand.saveError'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-card demand-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demand-flow-title"
      >
        <header className="modal-header modal-header--danger">
          <div>
            <p className="eyebrow">{t('demand.eyebrow')}</p>
            <h2 id="demand-flow-title">{t('demand.title')}</h2>
            <p>{t('demand.description')}</p>
          </div>

          <button
            type="button"
            className="icon-button"
            aria-label={t('demand.close')}
            onClick={handleClose}
          >
            ×
          </button>
        </header>

        <form className="emergency-form emergency-form--simplified" onSubmit={handleSubmit}>
          <p className="emergency-helper emergency-helper--danger">
            {t('demand.helper')}
          </p>

          <fieldset>
            <legend>{t('demand.quickSection')}</legend>

            <div className="compact-form-grid">
              <label>
                <span>{t('location.name')}</span>
                <input
                  value={locationName}
                  onChange={(event) => setLocationName(event.target.value)}
                  placeholder={t('location.nameDemandPlaceholder')}
                  autoFocus
                />
              </label>

              <label>
                <span>{t('location.area')}</span>
                <input
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  placeholder={t('location.areaPlaceholder')}
                />
              </label>

              <label>
                <span>{t('location.phone')}</span>
                <input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  placeholder={t('location.phonePlaceholder')}
                  inputMode="tel"
                />
              </label>
            </div>

            <div className="quick-actions-row">
              <button
                type="button"
                className="small-action-button small-action-button--danger"
                onClick={() => void handleUseCurrentLocation()}
                disabled={isGettingLocation}
              >
                {isGettingLocation
                  ? t('location.getting')
                  : t('location.useCurrent')}
              </button>

              <button
                type="button"
                className="details-toggle-button"
                onClick={() => setShowLocationDetails((current) => !current)}
              >
                {showLocationDetails
                  ? t('common.hideDetails')
                  : t('common.showDetails')}
              </button>

              {geoMessage && <span className="geo-message">{geoMessage}</span>}
            </div>

            {showLocationDetails && (
              <div className="details-card details-card--danger">
                <h3>{t('demand.advancedSection')}</h3>

                <div className="form-grid">
                  <label>
                    <span>{t('location.code')}</span>
                    <input
                      value={locationCode}
                      onChange={(event) => setLocationCode(event.target.value)}
                      placeholder={t('location.codeDemandPlaceholder')}
                    />
                  </label>

                  <label>
                    <span>{t('location.type')}</span>
                    <select
                      value={locationType}
                      onChange={(event) =>
                        setLocationType(event.target.value as ReliefLocationType)
                      }
                    >
                      {demandLocationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {t(type.labelKey)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>{t('location.contactAlias')}</span>
                    <input
                      value={contactAlias}
                      onChange={(event) => setContactAlias(event.target.value)}
                      placeholder={t('location.contactAliasDemandPlaceholder')}
                    />
                  </label>

                  <label>
                    <span>{t('location.contactName')}</span>
                    <input
                      value={contactName}
                      onChange={(event) => setContactName(event.target.value)}
                      placeholder={t('common.optional')}
                    />
                  </label>

                  <label>
                    <span>{t('location.address')}</span>
                    <input
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder={t('common.optional')}
                    />
                  </label>

                  <label>
                    <span>{t('location.latitude')}</span>
                    <input
                      value={latitude}
                      onChange={(event) => setLatitude(event.target.value)}
                      placeholder={t('common.optional')}
                      inputMode="decimal"
                    />
                  </label>

                  <label>
                    <span>{t('location.longitude')}</span>
                    <input
                      value={longitude}
                      onChange={(event) => setLongitude(event.target.value)}
                      placeholder={t('common.optional')}
                      inputMode="decimal"
                    />
                  </label>
                </div>

                <label className="full-width">
                  <span>{t('location.notes')}</span>
                  <textarea
                    value={locationNotes}
                    onChange={(event) => setLocationNotes(event.target.value)}
                    placeholder={t('location.notesDemandPlaceholder')}
                    rows={2}
                  />
                </label>
              </div>
            )}
          </fieldset>

          <fieldset>
            <div className="fieldset-title-row">
              <legend>{t('demand.itemsSection')}</legend>

              <div className="fieldset-actions">
                <button
                  type="button"
                  className="small-action-button small-action-button--danger"
                  onClick={() => setShowItemDetails((current) => !current)}
                >
                  {showItemDetails
                    ? t('common.hideDetails')
                    : t('common.showDetails')}
                </button>

                <button
                  type="button"
                  className="small-action-button small-action-button--danger"
                  onClick={addItem}
                >
                  {t('demand.addItem')}
                </button>
              </div>
            </div>

            <div className="supply-items-list">
              {items.map((item, index) => (
                <div className="supply-item-card demand-item-card" key={item.id}>
                  <div className="supply-item-header">
                    <strong>
                      {t('demand.itemTitle', {
                        index: index + 1
                      })}
                    </strong>

                    {items.length > 1 && (
                      <button
                        type="button"
                        className="danger-link-button"
                        onClick={() => removeItem(item.id)}
                      >
                        {t('demand.remove')}
                      </button>
                    )}
                  </div>

                  <div className="compact-form-grid compact-form-grid--demand-item">
                    <label>
                      <span>{t('demand.medicineName')}</span>
                      <input
                        value={item.medicineName}
                        onChange={(event) =>
                          updateItem(item.id, 'medicineName', event.target.value)
                        }
                        placeholder={t('demand.medicinePlaceholder')}
                      />
                    </label>

                    <label>
                      <span>{t('demand.quantity')}</span>
                      <input
                        value={item.requestedQuantity}
                        onChange={(event) =>
                          updateItem(
                            item.id,
                            'requestedQuantity',
                            event.target.value
                          )
                        }
                        inputMode="decimal"
                        placeholder="5"
                      />
                    </label>

                    <label>
                      <span>{t('demand.unit')}</span>
                      <select
                        value={item.unit}
                        onChange={(event) =>
                          updateItem(item.id, 'unit', event.target.value)
                        }
                      >
                        {unitOptions.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {t(unit.labelKey)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>{t('demand.priority')}</span>
                      <select
                        value={item.priority}
                        onChange={(event) =>
                          updatePriority(
                            item.id,
                            event.target.value as DemandPriority
                          )
                        }
                      >
                        {demandPriorityOptions.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {t(priority.labelKey)} — {t(priority.descriptionKey)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {showItemDetails && (
                    <div className="details-card details-card--item details-card--danger">
                      <div className="form-grid">
                        <label>
                          <span>{t('demand.medicineCode')}</span>
                          <input
                            value={item.medicineCode}
                            onChange={(event) =>
                              updateItem(item.id, 'medicineCode', event.target.value)
                            }
                            placeholder={t('common.optional')}
                          />
                        </label>

                        <label>
                          <span>{t('demand.patientGroup')}</span>
                          <input
                            value={item.patientGroup}
                            onChange={(event) =>
                              updateItem(item.id, 'patientGroup', event.target.value)
                            }
                            placeholder={t('demand.patientGroupPlaceholder')}
                          />
                        </label>
                      </div>

                      <label className="full-width">
                        <span>{t('demand.itemNotes')}</span>
                        <textarea
                          value={item.notes}
                          onChange={(event) =>
                            updateItem(item.id, 'notes', event.target.value)
                          }
                          placeholder={t('demand.itemNotesPlaceholder')}
                          rows={2}
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </fieldset>

          {error && <p className="form-message form-message--error">{error}</p>}
          {successMessage && (
            <p className="form-message form-message--success">{successMessage}</p>
          )}

          <footer className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
              disabled={isSaving}
            >
              {t('demand.clear')}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleClose}
              disabled={isSaving}
            >
              {t('demand.close')}
            </button>

            <button
              type="submit"
              className="submit-button submit-button--danger"
              disabled={isSaving}
            >
              {isSaving ? t('demand.saving') : t('demand.save')}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}