'use client'

import { FacilityType } from './types'
import { FormData } from './types'
import { BioAlliedLabsForm } from './facility-types/bio-allied-labs'
import { ManufacturingLabsForm } from './facility-types/manufacturing-labs'
import { PrototypingLabsForm } from './facility-types/prototyping-labs'
import { SoftwareForm } from './facility-types/software'
import { SaasAlliedForm } from './facility-types/saas-allied'
import { RawSpaceOfficeForm } from './facility-types/raw-space-office'
import { RawSpaceLabForm } from './facility-types/raw-space-lab'
import { IndividualCabinForm } from './facility-types/individual-cabin'
import { CoworkingSpacesForm } from './facility-types/coworking-spaces'
import { MeetingRoomsForm } from './facility-types/meeting-rooms'
import { StudioForm } from './facility-types/studio'
import { EventWorkspaceForm } from './facility-types/event-workspace'

interface FacilityFormProps {
  type: FacilityType
  onSubmit: (data: FormData) => void
  onChange?: () => void
  initialData?: any
}

// Create a wrapper function to handle the type conversion
const createSubmitHandler = (handler: (data: FormData) => void) => {
  return (data: any) => {
    handler(data as FormData);
  };
};

export function FacilityForm({ type, onSubmit, onChange, initialData }: FacilityFormProps) {
  // Create a type-safe submit handler
  const submitHandler = createSubmitHandler(onSubmit);
  
 // console.log('FacilityForm type:', type);
 // console.log('FacilityForm initialData:', initialData);
 // console.log('Type check:', type === 'event-workspace');

  switch (type) {
    case 'individual-cabin':
      return <IndividualCabinForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    case 'coworking-spaces':
      return <CoworkingSpacesForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    case 'meeting-rooms':
      return <MeetingRoomsForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    case 'bio-allied-labs':
      return <BioAlliedLabsForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    case 'manufacturing-labs':
      return <ManufacturingLabsForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    case 'prototyping-labs':
      return <PrototypingLabsForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    case 'software':
      return <SoftwareForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    case 'saas-allied':
      return <SaasAlliedForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    case 'raw-space-office':
      return <RawSpaceOfficeForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    case 'raw-space-lab':
      return <RawSpaceLabForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    case 'studio':
      return <StudioForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    case 'event-workspace': // NEW
     // console.log('Rendering EventWorkspaceForm');
      return <EventWorkspaceForm onSubmit={submitHandler} onChange={onChange} initialData={initialData} />
    default:
      console.error('Unknown facility type:', type);
      return <div>Form type not implemented: {type}</div>
  }
} 