// import { useMemo, useState } from 'react';
// import {
//   findOrCreateOfflineLocation,
//   saveOfflineDemand
// } from '../../db/offlineQueue';
// import type {
//   DemandPriority,
//   ReliefLocationType
// } from '../../db/localTypes';

// type DemandFlowModalProps = {
//   isOpen: boolean;
//   onClose: () => void;
// };

// type DemandFormItem = {
//   id: string;
//   medicineName: string;
//   medicineCode: string;
//   requestedQuantity: string;
//   unit: string;
//   priority: DemandPriority;
//   patientGroup: string;
//   notes: string;
// };

// const locationTypes: Array<{
//   value: ReliefLocationType;
//   label: string;
// }> = [
//   { value: 'Hospital', label: 'Hospital' },
//   { value: 'MedicalPost', label: 'Posto médico' },
//   { value: 'Shelter', label: 'Abrigo' },
//   { value: 'MobileUnit', label: 'Unidade móvel' },
//   { value: 'Ngo', label: 'ONG' },
//   { value: 'Other', label: 'Outro' }
// ];

// const priorities: Array<{
//   value: DemandPriority;
//   label: string;
//   description: string;
// }> = [
//   {
//     value: 'Critical',
//     label: 'Crítica',
//     description: 'risco imediato, priorizar agora'
//   },
//   {
//     value: 'High',
//     label: 'Alta',
//     description: 'necessidade urgente'
//   },
//   {
//     value: 'Medium',
//     label: 'Média',
//     description: 'necessidade importante'
//   },
//   {
//     value: 'Low',
//     label: 'Baixa',
//     description: 'pode aguardar'
//   }
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

// function createEmptyDemandItem(): DemandFormItem {
//   return {
//     id: crypto.randomUUID(),
//     medicineName: '',
//     medicineCode: '',
//     requestedQuantity: '',
//     unit: 'caixas',
//     priority: 'Critical',
//     patientGroup: '',
//     notes: ''
//   };
// }

// export function DemandFlowModal({ isOpen, onClose }: DemandFlowModalProps) {
//   const [locationName, setLocationName] = useState('');
//   const [locationCode, setLocationCode] = useState('');
//   const [locationType, setLocationType] =
//     useState<ReliefLocationType>('Hospital');
//   const [area, setArea] = useState('');
//   const [contactAlias, setContactAlias] = useState('');
//   const [address, setAddress] = useState('');
//   const [locationNotes, setLocationNotes] = useState('');

//   const [items, setItems] = useState<DemandFormItem[]>([
//     createEmptyDemandItem()
//   ]);

//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const [isSaving, setIsSaving] = useState(false);

//   const validItems = useMemo(() => {
//     return items.filter((item) =>
//       item.medicineName.trim().length > 0 &&
//       Number(item.requestedQuantity.replace(',', '.')) > 0 &&
//       item.unit.trim().length > 0
//     );
//   }, [items]);

//   if (!isOpen) {
//     return null;
//   }

//   function updateItem(
//     id: string,
//     field: keyof DemandFormItem,
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

//   function updatePriority(
//     id: string,
//     value: DemandPriority
//   ): void {
//     setItems((current) =>
//       current.map((item) =>
//         item.id === id
//           ? {
//               ...item,
//               priority: value
//             }
//           : item
//       )
//     );
//   }

//   function addItem(): void {
//     setItems((current) => [...current, createEmptyDemandItem()]);
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
//     setLocationType('Hospital');
//     setArea('');
//     setContactAlias('');
//     setAddress('');
//     setLocationNotes('');
//     setItems([createEmptyDemandItem()]);
//     setError(null);
//     setSuccessMessage(null);
//   }

//   function handleClose(): void {
//     resetForm();
//     onClose();
//   }

//   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     setError(null);
//     setSuccessMessage(null);

//     if (locationName.trim().length < 2) {
//       setError('Informe o nome do local. Exemplo: Hospital Caracas 02.');
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

//       return Number(item.requestedQuantity.replace(',', '.')) <= 0;
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
//         await saveOfflineDemand({
//           locationClientOperationId: location.clientOperationId,
//           medicineName: item.medicineName,
//           medicineCode: item.medicineCode,
//           requestedQuantity: Number(item.requestedQuantity.replace(',', '.')),
//           unit: item.unit,
//           priority: item.priority,
//           patientGroup: item.patientGroup,
//           notes: item.notes
//         });
//       }

//       setSuccessMessage(
//         `${validItems.length} demanda(s) salva(s) offline para ${location.name}.`
//       );

//       setItems([createEmptyDemandItem()]);
//       setLocationNotes('');
//     } catch {
//       setError('Não foi possível salvar a demanda offline.');
//     } finally {
//       setIsSaving(false);
//     }
//   }

//   return (
//     <div className="modal-backdrop" role="presentation">
//       <section
//         className="modal-card demand-modal"
//         role="dialog"
//         aria-modal="true"
//         aria-labelledby="demand-flow-title"
//       >
//         <header className="modal-header modal-header--danger">
//           <div>
//             <p className="eyebrow">Demanda offline</p>
//             <h2 id="demand-flow-title">Preciso de remédios</h2>
//             <p>
//               Registre necessidades urgentes do local. O dado fica salvo no
//               dispositivo mesmo sem internet.
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
//             <legend>Local da demanda</legend>

//             <div className="form-grid">
//               <label>
//                 <span>Nome do local *</span>
//                 <input
//                   value={locationName}
//                   onChange={(event) => setLocationName(event.target.value)}
//                   placeholder="Ex.: Hospital Caracas 02"
//                   autoFocus
//                 />
//               </label>

//               <label>
//                 <span>Código do local</span>
//                 <input
//                   value={locationCode}
//                   onChange={(event) => setLocationCode(event.target.value)}
//                   placeholder="Ex.: HOSP-002"
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
//                   placeholder="Ex.: triagem emergência"
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
//                 placeholder="Ex.: ala de emergência, entrada lateral, ponto de triagem"
//                 rows={2}
//               />
//             </label>
//           </fieldset>

//           <fieldset>
//             <div className="fieldset-title-row">
//               <legend>Medicamentos necessários</legend>

//               <button
//                 type="button"
//                 className="small-action-button small-action-button--danger"
//                 onClick={addItem}
//               >
//                 + adicionar demanda
//               </button>
//             </div>

//             <div className="supply-items-list">
//               {items.map((item, index) => (
//                 <div className="supply-item-card demand-item-card" key={item.id}>
//                   <div className="supply-item-header">
//                     <strong>Demanda {index + 1}</strong>

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
//                       <span>Quantidade necessária *</span>
//                       <input
//                         value={item.requestedQuantity}
//                         onChange={(event) =>
//                           updateItem(
//                             item.id,
//                             'requestedQuantity',
//                             event.target.value
//                           )
//                         }
//                         inputMode="decimal"
//                         placeholder="Ex.: 5"
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
//                       <span>Urgência *</span>
//                       <select
//                         value={item.priority}
//                         onChange={(event) =>
//                           updatePriority(
//                             item.id,
//                             event.target.value as DemandPriority
//                           )
//                         }
//                       >
//                         {priorities.map((priority) => (
//                           <option key={priority.value} value={priority.value}>
//                             {priority.label} — {priority.description}
//                           </option>
//                         ))}
//                       </select>
//                     </label>

//                     <label>
//                       <span>Grupo atendido</span>
//                       <input
//                         value={item.patientGroup}
//                         onChange={(event) =>
//                           updateItem(item.id, 'patientGroup', event.target.value)
//                         }
//                         placeholder="Ex.: triagem, pediatria, emergência"
//                       />
//                     </label>
//                   </div>

//                   <label className="full-width">
//                     <span>Observação da demanda</span>
//                     <textarea
//                       value={item.notes}
//                       onChange={(event) =>
//                         updateItem(item.id, 'notes', event.target.value)
//                       }
//                       placeholder="Ex.: necessidade crítica para triagem"
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
//               className="submit-button submit-button--danger"
//               disabled={isSaving}
//             >
//               {isSaving ? 'Salvando...' : 'Salvar demanda offline'}
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
  saveOfflineDemand
} from '../../db/offlineQueue';
import type {
  DemandPriority,
  ReliefLocationType
} from '../../db/localTypes';
import { getCurrentBrowserPosition } from '../../shared/utils/geolocation';

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

const locationTypes: Array<{
  value: ReliefLocationType;
  label: string;
}> = [
  { value: 'Hospital', label: 'Hospital' },
  { value: 'MedicalPost', label: 'Posto médico' },
  { value: 'Shelter', label: 'Abrigo' },
  { value: 'MobileUnit', label: 'Unidade móvel' },
  { value: 'Ngo', label: 'ONG' },
  { value: 'Other', label: 'Outro' }
];

const priorities: Array<{
  value: DemandPriority;
  label: string;
  description: string;
}> = [
  {
    value: 'Critical',
    label: 'Crítica',
    description: 'risco imediato, priorizar agora'
  },
  {
    value: 'High',
    label: 'Alta',
    description: 'necessidade urgente'
  },
  {
    value: 'Medium',
    label: 'Média',
    description: 'necessidade importante'
  },
  {
    value: 'Low',
    label: 'Baixa',
    description: 'pode aguardar'
  }
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

function createEmptyDemandItem(): DemandFormItem {
  return {
    id: crypto.randomUUID(),
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

export function DemandFlowModal({ isOpen, onClose }: DemandFlowModalProps) {
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

  const [error, setError] = useState<string | null>(null);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const validItems = useMemo(() => {
    return items.filter((item) =>
      item.medicineName.trim().length > 0 &&
      Number(item.requestedQuantity.replace(',', '.')) > 0 &&
      item.unit.trim().length > 0
    );
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
      setError('Informe o nome do local. Exemplo: Hospital Caracas 02.');
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
        await saveOfflineDemand({
          locationClientOperationId: location.clientOperationId,
          medicineName: item.medicineName,
          medicineCode: item.medicineCode,
          requestedQuantity: Number(item.requestedQuantity.replace(',', '.')),
          unit: item.unit,
          priority: item.priority,
          patientGroup: item.patientGroup,
          notes: item.notes
        });
      }

      setSuccessMessage(
        `${validItems.length} demanda(s) salva(s) offline para ${location.name}.`
      );

      setItems([createEmptyDemandItem()]);
    } catch {
      setError('Não foi possível salvar a demanda offline.');
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
            <p className="eyebrow">Demanda offline</p>
            <h2 id="demand-flow-title">Preciso de remédios</h2>
            <p>
              Registre necessidades urgentes do local. O dado fica salvo no
              dispositivo mesmo sem internet.
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
            <legend>Local da demanda</legend>

            <div className="form-grid">
              <label>
                <span>Nome do local *</span>
                <input
                  value={locationName}
                  onChange={(event) => setLocationName(event.target.value)}
                  placeholder="Ex.: Hospital Caracas 02"
                  autoFocus
                />
              </label>

              <label>
                <span>Código do local</span>
                <input
                  value={locationCode}
                  onChange={(event) => setLocationCode(event.target.value)}
                  placeholder="Ex.: HOSP-002"
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
                  placeholder="Ex.: triagem emergência"
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
                className="small-action-button small-action-button--danger"
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
                placeholder="Ex.: ala de emergência, entrada lateral, ponto de triagem"
                rows={2}
              />
            </label>
          </fieldset>

          <fieldset>
            <div className="fieldset-title-row">
              <legend>Medicamentos necessários</legend>

              <button
                type="button"
                className="small-action-button small-action-button--danger"
                onClick={addItem}
              >
                + adicionar demanda
              </button>
            </div>

            <div className="supply-items-list">
              {items.map((item, index) => (
                <div className="supply-item-card demand-item-card" key={item.id}>
                  <div className="supply-item-header">
                    <strong>Demanda {index + 1}</strong>

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
                      <span>Quantidade necessária *</span>
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
                        placeholder="Ex.: 5"
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
                      <span>Urgência *</span>
                      <select
                        value={item.priority}
                        onChange={(event) =>
                          updatePriority(
                            item.id,
                            event.target.value as DemandPriority
                          )
                        }
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label} — {priority.description}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Grupo atendido</span>
                      <input
                        value={item.patientGroup}
                        onChange={(event) =>
                          updateItem(item.id, 'patientGroup', event.target.value)
                        }
                        placeholder="Ex.: triagem, pediatria, emergência"
                      />
                    </label>
                  </div>

                  <label className="full-width">
                    <span>Observação da demanda</span>
                    <textarea
                      value={item.notes}
                      onChange={(event) =>
                        updateItem(item.id, 'notes', event.target.value)
                      }
                      placeholder="Ex.: necessidade crítica para triagem"
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
              className="submit-button submit-button--danger"
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar demanda offline'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}