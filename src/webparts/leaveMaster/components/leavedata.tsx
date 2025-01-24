import * as React from 'react';
// import { Link } from '@fluentui/react';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Text } from '@fluentui/react/lib/Text';
// import { TextField } from '@fluentui/react/lib/TextField';
// import { PrimaryButton } from '@fluentui/react/lib/Button'; // For Edit Button
// import { useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from './LeaveMaster.module.scss';
// import { WebPartContext } from '@microsoft/sp-webpart-base';
// import { Navigation } from 'react-router-dom';
// import { Navigation } from '@pnp/sp/navigation/types';

interface ILeaveItem {
  Id?: number;
  Title: string;
  leave_type: string;
  leave_date: string;
  aproval: string;
}

interface ILeaveDataProps {
  leaveItems: ILeaveItem[];
  loading: boolean;
}

const LeaveData: React.FC<ILeaveDataProps> = ({ leaveItems, loading }) => {
  // const [searchTitle, setSearchTitle] = React.useState<string>(''); // For Title filter
  // const navigate = useNavigate(); // React Router's navigate function

  // Redirect to the edit-page/:id route
  // const handleEditClick = (item: ILeaveItem): void => {
  //   if (item.Id) {
  //     window.location.href =`/sites/Ashim_Team_Site/_layouts/15/workbench.aspx/${item.Id}`
  //   }
  // };

  // Columns definition with Edit functionality
  const columns: IColumn[] = [
    {
      key: 'column1',
      name: 'Title',
      fieldName: 'Title',
      minWidth: 100,
      maxWidth: 200,
    },
    {
      key: 'column2',
      name: 'Leave Type',
      fieldName: 'leave_type',
      minWidth: 100,
      maxWidth: 200,
    },
    {
      key: 'column3',
      name: 'Leave Date',
      fieldName: 'leave_date',
      minWidth: 100,
      maxWidth: 200,
    },
    {
      key: 'column4',
      name: 'Approval Status',
      fieldName: 'aproval',
      minWidth: 100,
      maxWidth: 200,
    },
    {
      key: 'column5',
      name: 'Actions',
      minWidth: 100,
      maxWidth: 150,
      onRender: (item: ILeaveItem) => (
        <a
        href={`/sites/Ashim_Team_Site/_layouts/15/workbench.aspx/#${item.Id}`}
        
      >
        Edit
      </a>
      ),
    },
  ];

  // Search bar to filter by Title
  // const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  //   setSearchTitle(event.target.value); // Set search term for Title
  // };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size={SpinnerSize.large} label="Loading data..." />
      </div>
    );
  }


  function handleRowClick(item?: ILeaveItem, index?: number, ev?: Event): void {
    if (ev && ev instanceof MouseEvent) {
      // Your implementation here
      console.log(item, index, ev);
    }
  }

  return (
    <div className={styles.leaveDataContainer}>
      <Text variant="xLarge" className={styles.title}>
        Leave Data
      </Text>

      {/* Search Input for Title */}
     

      {leaveItems.length > 0 ? (
        <DetailsList
        items={leaveItems}
        columns={columns}
        layoutMode={DetailsListLayoutMode.fixedColumns}
        isHeaderVisible={true}
        onItemInvoked={handleRowClick} // Add row click handler
        selectionMode={SelectionMode.none} // Disable checkboxes
      />
      ) : (
        <MessageBar messageBarType={MessageBarType.info}>
          No data available.
        </MessageBar>
      )}
    </div>
  );
};

export default LeaveData;
