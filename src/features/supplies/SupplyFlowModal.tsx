// import { useMemo, useState } from 'react';
// import {
//   findOrCreateOfflineLocation,
//   saveOfflineSupply
// } from '../../db/offlineQueue';
// import type {
//   ReliefLocationType
// } from '../../db/localTypes';

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

// export function SupplyFlowModal({ isOpen, onClose }: SupplyFlowModalProps) {
//   const [locationName, setLocationName] = useState('');
//   const [locationCode, setLocationCode] = useState('');
//   const [locationType, setLocationType] = useState<ReliefLocationType>('Shelter');
//   const [area, setArea] = useState('');
//   const [contactAlias, setContactAlias] = useState('');
//   const [address, setAddress] = useState('');
//   const [locationNotes, setLocationNotes] = useState('');

//   const [items, setItems] = useState<SupplyFormItem[]>([
//     createEmptySupplyItem()
//   ]);

//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const [isSaving, setIsSaving] = useState(false);

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
//     setAddress('');
//     setLocationNotes('');
//     setItems([createEmptySupplyItem()]);
//     setError(null);
//     setSuccessMessage(null);
//   }

//   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

//     const invalidQuantity = items.some((item) => {
//       if (item.medicineName.trim().length === 0) {
//         return false;
//       }

//       return Number(item.quantity.replace(',', '.')) <= 0;
//     });

//     if (invalidQuantity) {
//       setError('Existe medicamento com quantidade inválida.');
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
//         address,
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
//       setLocationNotes('');
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
//                 <span>Endereço curto</span>
//                 <input
//                   value={address}
//                   onChange={(event) => setAddress(event.target.value)}
//                   placeholder="Opcional"
//                 />
//               </label>
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

//   function handleClose(): void {
//   resetForm();
//   onClose();
// }
// }



import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import {
  findOrCreateOfflineLocation,
  saveOfflineSupply
} from '../../db/offlineQueue';
import type { ReliefLocationType } from '../../db/localTypes';
import { getCurrentBrowserPosition } from '../../shared/utils/geolocation';

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

const locationTypes: Array<{
  value: ReliefLocationType;
  label: string;
}> = [
  { value: 'Shelter', label: 'Abrigo' },
  { value: 'Warehouse', label: 'Depósito' },
  { value: 'CollectionPoint', label: 'Ponto de coleta' },
  { value: 'MedicalPost', label: 'Posto médico' },
  { value: 'Ngo', label: 'ONG' },
  { value: 'MobileUnit', label: 'Unidade móvel' },
  { value: 'Other', label: 'Outro' }
];

const units = [
  'caixas',
  'comprimidos',
  'frascos',
  'ampolas',
  'unidades',
  'kits',
  'litros',
  'ml',
  'pacotes'
];

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

export function SupplyFlowModal({ isOpen, onClose }: SupplyFlowModalProps) {
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

  const [error, setError] = useState<string | null>(null);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const validItems = useMemo(() => {
    return items.filter((item) =>
      item.medicineName.trim().length > 0 &&
      Number(item.quantity.replace(',', '.')) > 0 &&
      item.unit.trim().length > 0
    );
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
      setGeoMessage('Localização preenchida com sucesso.');
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : 'Falha ao obter localização.';

      setGeoMessage(message);
    } finally {
      setIsGettingLocation(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccessMessage(null);

    if (locationName.trim().length < 2) {
      setError('Informe o nome do local. Exemplo: Abrigo La Guaira 01.');
      return;
    }

    if (validItems.length === 0) {
      setError('Informe pelo menos um medicamento com quantidade válida.');
      return;
    }

    const parsedLatitude = parseNullableNumber(latitude);
    const parsedLongitude = parseNullableNumber(longitude);

    if (parsedLatitude !== null && (parsedLatitude < -90 || parsedLatitude > 90)) {
      setError('Latitude deve estar entre -90 e 90.');
      return;
    }

    if (
      parsedLongitude !== null &&
      (parsedLongitude < -180 || parsedLongitude > 180)
    ) {
      setError('Longitude deve estar entre -180 e 180.');
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
          quantity: Number(item.quantity.replace(',', '.')),
          unit: item.unit,
          expiresOn: item.expiresOn || null,
          batchNumber: item.batchNumber,
          notes: item.notes
        });
      }

      setSuccessMessage(
        `${validItems.length} oferta(s) salva(s) offline para ${location.name}.`
      );

      setItems([createEmptySupplyItem()]);
    } catch {
      setError('Não foi possível salvar a oferta offline.');
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
            <p className="eyebrow">Oferta offline</p>
            <h2 id="supply-flow-title">Tenho remédios</h2>
            <p>
              Registre o local e os medicamentos disponíveis. Funciona sem internet.
            </p>
          </div>

          <button
            type="button"
            className="icon-button"
            aria-label="Fechar"
            onClick={handleClose}
          >
            ×
          </button>
        </header>

        <form className="emergency-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Local da oferta</legend>

            <div className="form-grid">
              <label>
                <span>Nome do local *</span>
                <input
                  value={locationName}
                  onChange={(event) => setLocationName(event.target.value)}
                  placeholder="Ex.: Abrigo La Guaira 01"
                  autoFocus
                />
              </label>

              <label>
                <span>Código do local</span>
                <input
                  value={locationCode}
                  onChange={(event) => setLocationCode(event.target.value)}
                  placeholder="Ex.: ABRIGO-001"
                />
              </label>

              <label>
                <span>Tipo</span>
                <select
                  value={locationType}
                  onChange={(event) =>
                    setLocationType(event.target.value as ReliefLocationType)
                  }
                >
                  {locationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Área / região</span>
                <input
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  placeholder="Ex.: Caracas, La Guaira"
                />
              </label>

              <label>
                <span>Contato simples</span>
                <input
                  value={contactAlias}
                  onChange={(event) => setContactAlias(event.target.value)}
                  placeholder="Ex.: coordenação manhã"
                />
              </label>

              <label>
                <span>Nome do contato</span>
                <input
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  placeholder="Opcional"
                />
              </label>

              <label>
                <span>Telefone do contato</span>
                <input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  placeholder="Opcional"
                  inputMode="tel"
                />
              </label>

              <label>
                <span>Endereço curto</span>
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Opcional"
                />
              </label>

              <label>
                <span>Latitude</span>
                <input
                  value={latitude}
                  onChange={(event) => setLatitude(event.target.value)}
                  placeholder="Opcional"
                  inputMode="decimal"
                />
              </label>

              <label>
                <span>Longitude</span>
                <input
                  value={longitude}
                  onChange={(event) => setLongitude(event.target.value)}
                  placeholder="Opcional"
                  inputMode="decimal"
                />
              </label>
            </div>

            <div className="geo-actions">
              <button
                type="button"
                className="small-action-button"
                onClick={() => void handleUseCurrentLocation()}
                disabled={isGettingLocation}
              >
                {isGettingLocation
                  ? 'Obtendo localização...'
                  : 'Usar localização atual'}
              </button>

              {geoMessage && <span>{geoMessage}</span>}
            </div>

            <label className="full-width">
              <span>Observação do local</span>
              <textarea
                value={locationNotes}
                onChange={(event) => setLocationNotes(event.target.value)}
                placeholder="Ex.: ponto de retirada na entrada principal"
                rows={2}
              />
            </label>
          </fieldset>

          <fieldset>
            <div className="fieldset-title-row">
              <legend>Medicamentos disponíveis</legend>

              <button
                type="button"
                className="small-action-button"
                onClick={addItem}
              >
                + adicionar medicamento
              </button>
            </div>

            <div className="supply-items-list">
              {items.map((item, index) => (
                <div className="supply-item-card" key={item.id}>
                  <div className="supply-item-header">
                    <strong>Medicamento {index + 1}</strong>

                    {items.length > 1 && (
                      <button
                        type="button"
                        className="danger-link-button"
                        onClick={() => removeItem(item.id)}
                      >
                        remover
                      </button>
                    )}
                  </div>

                  <div className="form-grid">
                    <label>
                      <span>Medicamento *</span>
                      <input
                        value={item.medicineName}
                        onChange={(event) =>
                          updateItem(item.id, 'medicineName', event.target.value)
                        }
                        placeholder="Ex.: Paracetamol 500mg"
                      />
                    </label>

                    <label>
                      <span>Código</span>
                      <input
                        value={item.medicineCode}
                        onChange={(event) =>
                          updateItem(item.id, 'medicineCode', event.target.value)
                        }
                        placeholder="Opcional"
                      />
                    </label>

                    <label>
                      <span>Quantidade *</span>
                      <input
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(item.id, 'quantity', event.target.value)
                        }
                        inputMode="decimal"
                        placeholder="Ex.: 10"
                      />
                    </label>

                    <label>
                      <span>Unidade *</span>
                      <select
                        value={item.unit}
                        onChange={(event) =>
                          updateItem(item.id, 'unit', event.target.value)
                        }
                      >
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Validade</span>
                      <input
                        value={item.expiresOn}
                        onChange={(event) =>
                          updateItem(item.id, 'expiresOn', event.target.value)
                        }
                        type="date"
                      />
                    </label>

                    <label>
                      <span>Lote</span>
                      <input
                        value={item.batchNumber}
                        onChange={(event) =>
                          updateItem(item.id, 'batchNumber', event.target.value)
                        }
                        placeholder="Opcional"
                      />
                    </label>
                  </div>

                  <label className="full-width">
                    <span>Observação do medicamento</span>
                    <textarea
                      value={item.notes}
                      onChange={(event) =>
                        updateItem(item.id, 'notes', event.target.value)
                      }
                      placeholder="Ex.: caixa fechada, disponível para retirada"
                      rows={2}
                    />
                  </label>
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
              Limpar
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleClose}
              disabled={isSaving}
            >
              Fechar
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar oferta offline'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}