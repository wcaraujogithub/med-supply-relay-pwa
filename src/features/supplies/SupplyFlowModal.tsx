// import type { FormEvent } from 'react';
// import { useMemo, useState } from 'react';
// import {
//   findOrCreateOfflineLocation,
//   saveOfflineSupply
// } from '../../db/offlineQueue';
// import type { ReliefLocationType } from '../../db/localTypes';
// import { getCurrentBrowserPosition } from '../../shared/utils/geolocation';

// type SupplyFlowModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
// };

// type SupplyFormItem = {
//   id: string;
//   medicineName: string;
//   medicineCode: string;
//   quantity: string;
//   unit: string;
//   expiresOn: string;
//   batchNumber: string;
//   notes: string;
// };

// const locationTypes: Array<{
//   value: ReliefLocationType;
//   label: string;
// }> = [
//   { value: 'Shelter', label: 'Abrigo' },
//   { value: 'Warehouse', label: 'Depósito' },
//   { value: 'CollectionPoint', label: 'Ponto de coleta' },
//   { value: 'MedicalPost', label: 'Posto médico' },
//   { value: 'Ngo', label: 'ONG' },
//   { value: 'MobileUnit', label: 'Unidade móvel' },
//   { value: 'Other', label: 'Outro' }
// ];

// const units = [
//   'caixas',
//   'comprimidos',
//   'frascos',
//   'ampolas',
//   'unidades',
//   'kits',
//   'litros',
//   'ml',
//   'pacotes'
// ];

// function createEmptySupplyItem(): SupplyFormItem {
//   return {
//     id: crypto.randomUUID(),
//     medicineName: '',
//     medicineCode: '',
//     quantity: '',
//     unit: 'caixas',
//     expiresOn: '',
//     batchNumber: '',
//     notes: ''
//   };
// }

// function parseNullableNumber(value: string): number | null {
//   if (!value.trim()) {
//     return null;
//   }

//   const parsed = Number(value.replace(',', '.'));

//   return Number.isFinite(parsed) ? parsed : null;
// }

// export function SupplyFlowModal({ isOpen, onClose }: SupplyFlowModalProps) {
//   const [locationName, setLocationName] = useState('');
//   const [locationCode, setLocationCode] = useState('');
//   const [locationType, setLocationType] = useState<ReliefLocationType>('Shelter');
//   const [area, setArea] = useState('');
//   const [contactAlias, setContactAlias] = useState('');
//   const [contactName, setContactName] = useState('');
//   const [contactPhone, setContactPhone] = useState('');
//   const [address, setAddress] = useState('');
//   const [latitude, setLatitude] = useState('');
//   const [longitude, setLongitude] = useState('');
//   const [locationNotes, setLocationNotes] = useState('');

//   const [items, setItems] = useState<SupplyFormItem[]>([
//     createEmptySupplyItem()
//   ]);

//   const [error, setError] = useState<string | null>(null);
//   const [geoMessage, setGeoMessage] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isGettingLocation, setIsGettingLocation] = useState(false);

//   const validItems = useMemo(() => {
//     return items.filter((item) =>
//       item.medicineName.trim().length > 0 &&
//       Number(item.quantity.replace(',', '.')) > 0 &&
//       item.unit.trim().length > 0
//     );
//   }, [items]);

//   if (!isOpen) {
//     return null;
//   }

//   function updateItem(
//     id: string,
//     field: keyof SupplyFormItem,
//     value: string
//   ): void {
//     setItems((current) =>
//       current.map((item) =>
//         item.id === id
//           ? {
//               ...item,
//               [field]: value
//             }
//           : item
//       )
//     );
//   }

//   function addItem(): void {
//     setItems((current) => [...current, createEmptySupplyItem()]);
//   }

//   function removeItem(id: string): void {
//     setItems((current) => {
//       if (current.length === 1) {
//         return current;
//       }

//       return current.filter((item) => item.id !== id);
//     });
//   }

//   function resetForm(): void {
//     setLocationName('');
//     setLocationCode('');
//     setLocationType('Shelter');
//     setArea('');
//     setContactAlias('');
//     setContactName('');
//     setContactPhone('');
//     setAddress('');
//     setLatitude('');
//     setLongitude('');
//     setLocationNotes('');
//     setItems([createEmptySupplyItem()]);
//     setError(null);
//     setGeoMessage(null);
//     setSuccessMessage(null);
//   }

//   function handleClose(): void {
//     resetForm();
//     onClose();
//   }

//   async function handleUseCurrentLocation(): Promise<void> {
//     setGeoMessage(null);
//     setError(null);
//     setIsGettingLocation(true);

//     try {
//       const position = await getCurrentBrowserPosition();

//       setLatitude(String(Number(position.latitude.toFixed(6))));
//       setLongitude(String(Number(position.longitude.toFixed(6))));
//       setGeoMessage('Localização preenchida com sucesso.');
//     } catch (currentError) {
//       const message =
//         currentError instanceof Error
//           ? currentError.message
//           : 'Falha ao obter localização.';

//       setGeoMessage(message);
//     } finally {
//       setIsGettingLocation(false);
//     }
//   }

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     setError(null);
//     setSuccessMessage(null);

//     if (locationName.trim().length < 2) {
//       setError('Informe o nome do local. Exemplo: Abrigo La Guaira 01.');
//       return;
//     }

//     if (validItems.length === 0) {
//       setError('Informe pelo menos um medicamento com quantidade válida.');
//       return;
//     }

//     const parsedLatitude = parseNullableNumber(latitude);
//     const parsedLongitude = parseNullableNumber(longitude);

//     if (parsedLatitude !== null && (parsedLatitude < -90 || parsedLatitude > 90)) {
//       setError('Latitude deve estar entre -90 e 90.');
//       return;
//     }

//     if (
//       parsedLongitude !== null &&
//       (parsedLongitude < -180 || parsedLongitude > 180)
//     ) {
//       setError('Longitude deve estar entre -180 e 180.');
//       return;
//     }

//     setIsSaving(true);

//     try {
//       const location = await findOrCreateOfflineLocation({
//         name: locationName,
//         code: locationCode,
//         type: locationType,
//         area,
//         contactAlias,
//         contactName,
//         contactPhone,
//         address,
//         latitude: parsedLatitude,
//         longitude: parsedLongitude,
//         notes: locationNotes
//       });

//       for (const item of validItems) {
//         await saveOfflineSupply({
//           locationClientOperationId: location.clientOperationId,
//           medicineName: item.medicineName,
//           medicineCode: item.medicineCode,
//           quantity: Number(item.quantity.replace(',', '.')),
//           unit: item.unit,
//           expiresOn: item.expiresOn || null,
//           batchNumber: item.batchNumber,
//           notes: item.notes
//         });
//       }

//       setSuccessMessage(
//         `${validItems.length} oferta(s) salva(s) offline para ${location.name}.`
//       );

//       setItems([createEmptySupplyItem()]);
//     } catch {
//       setError('Não foi possível salvar a oferta offline.');
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   return (
//     <div className="modal-backdrop" role="presentation">
//       <section
//         className="modal-card supply-modal"
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="supply-flow-title"
//       >
//         <header className="modal-header">
//           <div>
//             <p className="eyebrow">Oferta offline</p>
//             <h2 id="supply-flow-title">Tenho remédios</h2>
//             <p>
//               Registre o local e os medicamentos disponíveis. Funciona sem internet.
//             </p>
//           </div>

//           <button
//             type="button"
//             className="icon-button"
//             aria-label="Fechar"
//             onClick={handleClose}
//           >
//             ×
//           </button>
//         </header>

//         <form className="emergency-form" onSubmit={handleSubmit}>
//           <fieldset>
//             <legend>Local da oferta</legend>

//             <div className="form-grid">
//               <label>
//                 <span>Nome do local *</span>
//                 <input
//                   value={locationName}
//                   onChange={(event) => setLocationName(event.target.value)}
//                   placeholder="Ex.: Abrigo La Guaira 01"
//                   autoFocus
//                 />
//               </label>

//               <label>
//                 <span>Código do local</span>
//                 <input
//                   value={locationCode}
//                   onChange={(event) => setLocationCode(event.target.value)}
//                   placeholder="Ex.: ABRIGO-001"
//                 />
//               </label>

//               <label>
//                 <span>Tipo</span>
//                 <select
//                   value={locationType}
//                   onChange={(event) =>
//                     setLocationType(event.target.value as ReliefLocationType)
//                   }
//                 >
//                   {locationTypes.map((type) => (
//                     <option key={type.value} value={type.value}>
//                       {type.label}
//                     </option>
//                   ))}
//                 </select>
//               </label>

//               <label>
//                 <span>Área / região</span>
//                 <input
//                   value={area}
//                   onChange={(event) => setArea(event.target.value)}
//                   placeholder="Ex.: Caracas, La Guaira"
//                 />
//               </label>

//               <label>
//                 <span>Contato simples</span>
//                 <input
//                   value={contactAlias}
//                   onChange={(event) => setContactAlias(event.target.value)}
//                   placeholder="Ex.: coordenação manhã"
//                 />
//               </label>

//               <label>
//                 <span>Nome do contato</span>
//                 <input
//                   value={contactName}
//                   onChange={(event) => setContactName(event.target.value)}
//                   placeholder="Opcional"
//                 />
//               </label>

//               <label>
//                 <span>Telefone do contato</span>
//                 <input
//                   value={contactPhone}
//                   onChange={(event) => setContactPhone(event.target.value)}
//                   placeholder="Opcional"
//                   inputMode="tel"
//                 />
//               </label>

//               <label>
//                 <span>Endereço curto</span>
//                 <input
//                   value={address}
//                   onChange={(event) => setAddress(event.target.value)}
//                   placeholder="Opcional"
//                 />
//               </label>

//               <label>
//                 <span>Latitude</span>
//                 <input
//                   value={latitude}
//                   onChange={(event) => setLatitude(event.target.value)}
//                   placeholder="Opcional"
//                   inputMode="decimal"
//                 />
//               </label>

//               <label>
//                 <span>Longitude</span>
//                 <input
//                   value={longitude}
//                   onChange={(event) => setLongitude(event.target.value)}
//                   placeholder="Opcional"
//                   inputMode="decimal"
//                 />
//               </label>
//             </div>

//             <div className="geo-actions">
//               <button
//                 type="button"
//                 className="small-action-button"
//                 onClick={() => void handleUseCurrentLocation()}
//                 disabled={isGettingLocation}
//               >
//                 {isGettingLocation
//                   ? 'Obtendo localização...'
//                   : 'Usar localização atual'}
//               </button>

//               {geoMessage && <span>{geoMessage}</span>}
//             </div>

//             <label className="full-width">
//               <span>Observação do local</span>
//               <textarea
//                 value={locationNotes}
//                 onChange={(event) => setLocationNotes(event.target.value)}
//                 placeholder="Ex.: ponto de retirada na entrada principal"
//                 rows={2}
//               />
//             </label>
//           </fieldset>

//           <fieldset>
//             <div className="fieldset-title-row">
//               <legend>Medicamentos disponíveis</legend>

//               <button
//                 type="button"
//                 className="small-action-button"
//                 onClick={addItem}
//               >
//                 + adicionar medicamento
//               </button>
//             </div>

//             <div className="supply-items-list">
//               {items.map((item, index) => (
//                 <div className="supply-item-card" key={item.id}>
//                   <div className="supply-item-header">
//                     <strong>Medicamento {index + 1}</strong>

//                     {items.length > 1 && (
//                       <button
//                         type="button"
//                         className="danger-link-button"
//                         onClick={() => removeItem(item.id)}
//                       >
//                         remover
//                       </button>
//                     )}
//                   </div>

//                   <div className="form-grid">
//                     <label>
//                       <span>Medicamento *</span>
//                       <input
//                         value={item.medicineName}
//                         onChange={(event) =>
//                           updateItem(item.id, 'medicineName', event.target.value)
//                         }
//                         placeholder="Ex.: Paracetamol 500mg"
//                       />
//                     </label>

//                     <label>
//                       <span>Código</span>
//                       <input
//                         value={item.medicineCode}
//                         onChange={(event) =>
//                           updateItem(item.id, 'medicineCode', event.target.value)
//                         }
//                         placeholder="Opcional"
//                       />
//                     </label>

//                     <label>
//                       <span>Quantidade *</span>
//                       <input
//                         value={item.quantity}
//                         onChange={(event) =>
//                           updateItem(item.id, 'quantity', event.target.value)
//                         }
//                         inputMode="decimal"
//                         placeholder="Ex.: 10"
//                       />
//                     </label>

//                     <label>
//                       <span>Unidade *</span>
//                       <select
//                         value={item.unit}
//                         onChange={(event) =>
//                           updateItem(item.id, 'unit', event.target.value)
//                         }
//                       >
//                         {units.map((unit) => (
//                           <option key={unit} value={unit}>
//                             {unit}
//                           </option>
//                         ))}
//                       </select>
//                     </label>

//                     <label>
//                       <span>Validade</span>
//                       <input
//                         value={item.expiresOn}
//                         onChange={(event) =>
//                           updateItem(item.id, 'expiresOn', event.target.value)
//                         }
//                         type="date"
//                       />
//                     </label>

//                     <label>
//                       <span>Lote</span>
//                       <input
//                         value={item.batchNumber}
//                         onChange={(event) =>
//                           updateItem(item.id, 'batchNumber', event.target.value)
//                         }
//                         placeholder="Opcional"
//                       />
//                     </label>
//                   </div>

//                   <label className="full-width">
//                     <span>Observação do medicamento</span>
//                     <textarea
//                       value={item.notes}
//                       onChange={(event) =>
//                         updateItem(item.id, 'notes', event.target.value)
//                       }
//                       placeholder="Ex.: caixa fechada, disponível para retirada"
//                       rows={2}
//                     />
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </fieldset>

//           {error && <p className="form-message form-message--error">{error}</p>}
//           {successMessage && (
//             <p className="form-message form-message--success">{successMessage}</p>
//           )}

//           <footer className="modal-actions">
//             <button
//               type="button"
//               className="secondary-button"
//               onClick={resetForm}
//               disabled={isSaving}
//             >
//               Limpar
//             </button>

//             <button
//               type="button"
//               className="secondary-button"
//               onClick={handleClose}
//               disabled={isSaving}
//             >
//               Fechar
//             </button>

//             <button
//               type="submit"
//               className="submit-button"
//               disabled={isSaving}
//             >
//               {isSaving ? 'Salvando...' : 'Salvar oferta offline'}
//             </button>
//           </footer>
//         </form>
//       </section>
//     </div>
//   );
// }



import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import {
  findOrCreateOfflineLocation,
  saveOfflineSupply
} from '../../db/offlineQueue';
import type { ReliefLocationType } from '../../db/localTypes';
import { useI18n } from '../../i18n/I18nProvider';
import { getCurrentBrowserPosition } from '../../shared/utils/geolocation';
import {
  supplyLocationTypes,
  unitOptions
} from '../forms/emergencyFormOptions';

type SupplyFlowModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SupplyFormItem = {
  id: string;
  medicineName: string;
  medicineCode: string;
  quantity: string;
  unit: string;
  expiresOn: string;
  batchNumber: string;
  notes: string;
};

function createEmptySupplyItem(): SupplyFormItem {
  return {
    id: crypto.randomUUID(),
    medicineName: '',
    medicineCode: '',
    quantity: '',
    unit: 'caixas',
    expiresOn: '',
    batchNumber: '',
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

export function SupplyFlowModal({ isOpen, onClose }: SupplyFlowModalProps) {
  const { t } = useI18n();

  const [locationName, setLocationName] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [locationType, setLocationType] = useState<ReliefLocationType>('Shelter');
  const [area, setArea] = useState('');
  const [contactAlias, setContactAlias] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationNotes, setLocationNotes] = useState('');

  const [items, setItems] = useState<SupplyFormItem[]>([
    createEmptySupplyItem()
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
        parseQuantity(item.quantity) > 0 &&
        item.unit.trim().length > 0
      );
    });
  }, [items]);

  if (!isOpen) {
    return null;
  }

  function updateItem(
    id: string,
    field: keyof SupplyFormItem,
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

  function addItem(): void {
    setItems((current) => [...current, createEmptySupplyItem()]);
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
    setLocationType('Shelter');
    setArea('');
    setContactAlias('');
    setContactName('');
    setContactPhone('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setLocationNotes('');
    setItems([createEmptySupplyItem()]);
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
      setError(t('supply.requiredLocation'));
      return;
    }

    if (validItems.length === 0) {
      setError(t('supply.requiredItem'));
      return;
    }

    const parsedLatitude = parseNullableNumber(latitude);
    const parsedLongitude = parseNullableNumber(longitude);

    if (parsedLatitude !== null && (parsedLatitude < -90 || parsedLatitude > 90)) {
      setError(t('supply.invalidLatitude'));
      return;
    }

    if (
      parsedLongitude !== null &&
      (parsedLongitude < -180 || parsedLongitude > 180)
    ) {
      setError(t('supply.invalidLongitude'));
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
        await saveOfflineSupply({
          locationClientOperationId: location.clientOperationId,
          medicineName: item.medicineName,
          medicineCode: item.medicineCode,
          quantity: parseQuantity(item.quantity),
          unit: item.unit,
          expiresOn: item.expiresOn || null,
          batchNumber: item.batchNumber,
          notes: item.notes
        });
      }

      setSuccessMessage(
        t('supply.saveSuccess', {
          count: validItems.length,
          location: location.name
        })
      );

      setItems([createEmptySupplyItem()]);
      setShowItemDetails(false);
    } catch {
      setError(t('supply.saveError'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="modal-card supply-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supply-flow-title"
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{t('supply.eyebrow')}</p>
            <h2 id="supply-flow-title">{t('supply.title')}</h2>
            <p>{t('supply.description')}</p>
          </div>

          <button
            type="button"
            className="icon-button"
            aria-label={t('supply.close')}
            onClick={handleClose}
          >
            ×
          </button>
        </header>

        <form className="emergency-form emergency-form--simplified" onSubmit={handleSubmit}>
          <p className="emergency-helper">{t('supply.helper')}</p>

          <fieldset>
            <legend>{t('supply.quickSection')}</legend>

            <div className="compact-form-grid">
              <label>
                <span>{t('location.name')}</span>
                <input
                  value={locationName}
                  onChange={(event) => setLocationName(event.target.value)}
                  placeholder={t('location.nameSupplyPlaceholder')}
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
                className="small-action-button"
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
              <div className="details-card">
                <h3>{t('supply.advancedSection')}</h3>

                <div className="form-grid">
                  <label>
                    <span>{t('location.code')}</span>
                    <input
                      value={locationCode}
                      onChange={(event) => setLocationCode(event.target.value)}
                      placeholder={t('location.codeSupplyPlaceholder')}
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
                      {supplyLocationTypes.map((type) => (
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
                      placeholder={t('location.contactAliasSupplyPlaceholder')}
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
                    placeholder={t('location.notesSupplyPlaceholder')}
                    rows={2}
                  />
                </label>
              </div>
            )}
          </fieldset>

          <fieldset>
            <div className="fieldset-title-row">
              <legend>{t('supply.itemsSection')}</legend>

              <div className="fieldset-actions">
                <button
                  type="button"
                  className="small-action-button"
                  onClick={() => setShowItemDetails((current) => !current)}
                >
                  {showItemDetails
                    ? t('common.hideDetails')
                    : t('common.showDetails')}
                </button>

                <button
                  type="button"
                  className="small-action-button"
                  onClick={addItem}
                >
                  {t('supply.addItem')}
                </button>
              </div>
            </div>

            <div className="supply-items-list">
              {items.map((item, index) => (
                <div className="supply-item-card" key={item.id}>
                  <div className="supply-item-header">
                    <strong>
                      {t('supply.itemTitle', {
                        index: index + 1
                      })}
                    </strong>

                    {items.length > 1 && (
                      <button
                        type="button"
                        className="danger-link-button"
                        onClick={() => removeItem(item.id)}
                      >
                        {t('supply.remove')}
                      </button>
                    )}
                  </div>

                  <div className="compact-form-grid compact-form-grid--item">
                    <label>
                      <span>{t('supply.medicineName')}</span>
                      <input
                        value={item.medicineName}
                        onChange={(event) =>
                          updateItem(item.id, 'medicineName', event.target.value)
                        }
                        placeholder={t('supply.medicinePlaceholder')}
                      />
                    </label>

                    <label>
                      <span>{t('supply.quantity')}</span>
                      <input
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(item.id, 'quantity', event.target.value)
                        }
                        inputMode="decimal"
                        placeholder="10"
                      />
                    </label>

                    <label>
                      <span>{t('supply.unit')}</span>
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
                  </div>

                  {showItemDetails && (
                    <div className="details-card details-card--item">
                      <div className="form-grid">
                        <label>
                          <span>{t('supply.medicineCode')}</span>
                          <input
                            value={item.medicineCode}
                            onChange={(event) =>
                              updateItem(item.id, 'medicineCode', event.target.value)
                            }
                            placeholder={t('common.optional')}
                          />
                        </label>

                        <label>
                          <span>{t('supply.expiry')}</span>
                          <input
                            value={item.expiresOn}
                            onChange={(event) =>
                              updateItem(item.id, 'expiresOn', event.target.value)
                            }
                            type="date"
                          />
                        </label>

                        <label>
                          <span>{t('supply.batch')}</span>
                          <input
                            value={item.batchNumber}
                            onChange={(event) =>
                              updateItem(item.id, 'batchNumber', event.target.value)
                            }
                            placeholder={t('common.optional')}
                          />
                        </label>
                      </div>

                      <label className="full-width">
                        <span>{t('supply.itemNotes')}</span>
                        <textarea
                          value={item.notes}
                          onChange={(event) =>
                            updateItem(item.id, 'notes', event.target.value)
                          }
                          placeholder={t('supply.itemNotesPlaceholder')}
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
              {t('supply.clear')}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleClose}
              disabled={isSaving}
            >
              {t('supply.close')}
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={isSaving}
            >
              {isSaving ? t('supply.saving') : t('supply.save')}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}