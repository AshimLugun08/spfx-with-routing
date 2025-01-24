import * as React from 'react';
import { useParams } from 'react-router-dom';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { Text } from '@fluentui/react/lib/Text';
import { TextField } from '@fluentui/react/lib/TextField';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { WebPartContext } from '@microsoft/sp-webpart-base';

interface LeaveFormData {
  ID: number;
  Title: string;
  aproval: string;
  leave_date: string;
  leave_type: string;
  holidays: string;
}

const LeaveDataPage: React.FC<{ context: WebPartContext }> = ({ context }) => {
  const { id } = useParams<{ id: string }>();
  const [leaveData, setLeaveData] = React.useState<LeaveFormData | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [formData, setFormData] = React.useState<LeaveFormData | null>(null);
  const [leaveTypeOptions, setLeaveTypeOptions] = React.useState<IDropdownOption[]>([]);
  const [approvalStatusOptions, setApprovalStatusOptions] = React.useState<IDropdownOption[]>([]);

  // Fetch options dynamically from SharePoint list's field metadata
  const fetchChoiceFieldOptions = async (fieldTitle: string): Promise<IDropdownOption[]> => {
    try {
      if (!context) {
        throw new Error('SPFx context is not available.');
      }

      const sp = spfi().using(SPFx(context));
      const field = await sp.web.lists
        .getByTitle('leaves_master')
        .fields.getByTitle(fieldTitle)();
        
      return field?.Choices?.map((choice: string) => ({
        key: choice,
        text: choice,
      })) || [];
    } catch (error) {
      console.error('Error fetching field choices:', error);
      return [];
    }
  };

  // Fetch leave data and field choices
  const fetchLeaveData = async (id: string): Promise<void> => {
    try {
      if (!context) {
        throw new Error('SPFx context is not available.');
      }

      const sp = spfi().using(SPFx(context));
      const item = await sp.web.lists
        .getByTitle('leaves_master')
        .items.getById(Number(id))();
       
        // console.log(item)

      setLeaveData(item as LeaveFormData);
      setFormData(item as LeaveFormData); // Initialize form data with fetched data

      // Fetch dynamic options for "Leave Type" and "Approval Status"
      const leaveTypeChoices = await fetchChoiceFieldOptions('leave_type');
      const approvalStatusChoices = await fetchChoiceFieldOptions('aproval');
      
      setLeaveTypeOptions(leaveTypeChoices);
      setApprovalStatusOptions(approvalStatusChoices);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leave data:', error);
      setLoading(false);
    }
  };

  // Handle dropdown input change
  const handleDropdownChange = (
    fieldName: string,
    event: React.FormEvent<HTMLElement> | undefined, 
    option?: IDropdownOption
  ): void => {
    if (formData && option) {
      setFormData(prevFormData => ({
        ...prevFormData!,
        [fieldName]: option.key as string
      }));
    }
  };

  // Handle text field input change
  const handleTextFieldChange = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    const { name } = event.target as HTMLInputElement;
    if (formData) {
      setFormData({ ...formData, [name]: newValue || '' });
    }
  };

  // Save the changes to SharePoint list
  const saveChanges = async (): Promise<void> => {
    try {
      const sp = spfi().using(SPFx(context));
      
      // Explicitly select only the fields you want to update
      const updateData = {
        Title: formData?.Title,
        aproval: formData?.aproval,
        leave_date: formData?.leave_date,
        leave_type: formData?.leave_type,
        holidays: formData?.holidays
      };
  
      await sp.web.lists
        .getByTitle('leaves_master')
        .items.getById(Number(formData?.ID))
        .update(updateData);
  
      setLeaveData(formData);
      setIsEditing(false);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Detailed save error:', error);
      alert(`Error saving: ${error.message}`);
    }
  };
  // Fetch data when the page loads
  React.useEffect(() => {
    if (id) {
      fetchLeaveData(id).catch((error) => {
        console.error('Error in fetchLeaveData:', error);
      });
    }
  }, [id]);

  if (loading) {
    return <Spinner size={SpinnerSize.large} label="Loading data..." />;
  }

  if (!leaveData) {
    return (
      <Text variant="large" styles={{ root: { color: 'red' } }}>
        No data found for this ID
      </Text>
    );
  }

  return (
    <div>
      <Text variant="xLarge" styles={{ root: { marginBottom: 20 } }}>
        Leave Data for {leaveData.Title}
      </Text>
      {!isEditing ? (
        <Stack tokens={{ childrenGap: 15 }}>
          <Text>
            <strong>Leave Type:</strong> {leaveData.leave_type}
          </Text>
          <Text>
            <strong>Leave Date:</strong> {leaveData.leave_date}
          </Text>
          <Text>
            <strong>Approval Status:</strong> {leaveData.aproval}
          </Text>
          <PrimaryButton text="Edit" onClick={() => setIsEditing(true)} />
        </Stack>
      ) : (
        <Stack tokens={{ childrenGap: 15 }}>
          <Dropdown
  label="Leave Type"
      selectedKey={formData?.leave_type || undefined}
  onChange={(event, option) => handleDropdownChange('leave_type', event, option)}
  options={leaveTypeOptions}
/>
          <TextField
            label="Leave Date"
            type="date"
            name="leave_date"
            value={formData?.leave_date || ''}
            onChange={handleTextFieldChange}
          />
  <Dropdown
  label="Approval Status"
  selectedKey={formData?.aproval || undefined} 
  onChange={(event, option) => handleDropdownChange('aproval', event, option)}
  options={approvalStatusOptions}
/>
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <PrimaryButton text="Save" onClick={saveChanges} />
            <DefaultButton text="Cancel" onClick={() => setIsEditing(false)} />
          </Stack>
        </Stack>
      )}
    </div>
  );
};

export default LeaveDataPage;
