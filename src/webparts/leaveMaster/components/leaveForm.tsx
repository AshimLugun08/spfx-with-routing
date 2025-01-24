import * as React from 'react';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { TextField, Dropdown, IDropdownOption, Spinner, SpinnerSize } from '@fluentui/react';
// import { useNavigate } from 'react-router-dom'; // For redirection
// import { SPComponentLoader } from '@microsoft/sp-loader';

interface ILeaveFormProps {
  context: WebPartContext;
  // Remove onSubmit from props
}
interface LeaveFormData {
  title: string;
  aproval: string;
  leave_date: string;
  leave_type: string;
  holiday: string;
}

interface IFieldInfo {
  Title: string;
  TypeAsString: string;
  Choices?: string[];
}

const LeaveForm: React.FC<ILeaveFormProps> = ({  context }) => {
  const [formData, setFormData] = React.useState<LeaveFormData>({
    title: '',
    aproval: '',
    leave_date: '',
    leave_type: '',
    holiday: '',
  });

  const [leaveTypeOptions, setLeaveTypeOptions] = React.useState<IDropdownOption[]>([]);
  const [approvalOptions, setApprovalOptions] = React.useState<IDropdownOption[]>([]);
  const [holidayOptions, setHolidayOptions] = React.useState<IDropdownOption[]>([]);
  const [loading, setLoading] = React.useState(true);

  const sp = spfi().using(SPFx(context));
  // const navigate = useNavigate(); // Hook to handle navigation

  const fetchChoices = async (): Promise<void> => {
    try {
      const list = sp.web.lists.getByTitle('leaves_master');
      const fields: IFieldInfo[] = await list.fields
        .select('Title,TypeAsString,Choices')
        .filter("Title eq 'leave_type' or Title eq 'aproval'")();

      const leaveTypeField = fields.filter((field) => field.Title === 'leave_type')[0];
      const approvalField = fields.filter((field) => field.Title === 'aproval')[0];

      if (leaveTypeField?.Choices) {
        setLeaveTypeOptions(
          leaveTypeField.Choices.map((choice: string) => ({ key: choice, text: choice }))
        );
      }

      if (approvalField?.Choices) {
        setApprovalOptions(
          approvalField.Choices.map((choice: string) => ({ key: choice, text: choice }))
        );
      }

      const holidayItems = await sp.web.lists.getByTitle('Holiday_List_MD').items.select('Id,Title')();
      setHolidayOptions(
        holidayItems.map((holiday) => ({ key: holiday.Id, text: holiday.Title }))
      );
    } catch (error) {
      console.error('Error fetching choices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await sp.web.lists.getByTitle('leaves_master').items.add({
        Title: formData.title || '', // Ensure string value
        aproval: formData.aproval || '', // Ensure string value
        leave_date: formData.leave_date || '', // Ensure string value
        leave_type: formData.leave_type || '', // Ensure string value
        holidays: formData.holiday ? formData.holiday.toString() : '', // Convert to string
      });
      alert('Submitted successfully');
      setFormData({ title: '', aproval: '', leave_date: '', leave_type: '', holiday: '' });
    } catch (error) {
      console.error('Error submitting leave data:', error);
      alert(`Error in submitting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  
  
  React.useEffect(() => {
    fetchChoices().catch((error: Error) => {
      console.error('Failed to fetch choices:', error);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {loading ? (
        <Spinner size={SpinnerSize.large} label="Loading choices..." />
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <TextField
              label="Name"
              name="title"
              value={formData.title}
              onChange={(e, newValue) => setFormData({ ...formData, title: newValue || '' })}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Dropdown
              label="Approval Status"
              selectedKey={formData.aproval}
              onChange={(e, option) => setFormData({ ...formData, aproval: option ? option.key as string : '' })}
              options={approvalOptions}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <TextField
              label="Leave Date"
              type="date"
              name="leave_date"
              value={formData.leave_date}
              onChange={(e, newValue) => setFormData({ ...formData, leave_date: newValue || '' })}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Dropdown
              label="Leave Type"
              selectedKey={formData.leave_type}
              onChange={(e, option) => setFormData({ ...formData, leave_type: option ? option.key as string : '' })}
              options={leaveTypeOptions}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Dropdown
              label="Holiday"
              selectedKey={formData.holiday}
              onChange={(e, option) => setFormData({ ...formData, holiday: option ? option.key as string : '' })}
              options={holidayOptions}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
    <button
      type="submit"
      style={{
        padding: '10px 20px',
        backgroundColor: '#0078d4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
      }}
    >
      Submit
    </button>
  </div>
         
        </form>
      )}
    </div>
  );
};

export default LeaveForm;
