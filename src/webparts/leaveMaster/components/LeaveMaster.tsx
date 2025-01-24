import * as React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import styles from './LeaveMaster.module.scss'; // Ensure you have your SCSS styles set
import type { ILeaveMasterProps } from './ILeaveMasterProps';
import LeaveForm from './leaveForm';
import LeaveData from './leavedata';
import LeaveDataPage from './itemdeatails';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';

interface ILeaveItem {
  Id?: number;
  Title: string;
  leave_type: string;
  leave_date: string;
  aproval: string;
}

interface ILeaveMasterState {
  leaveItems: ILeaveItem[];
  loading: boolean;
}

export default class LeaveMaster extends React.Component<ILeaveMasterProps, ILeaveMasterState> {
  constructor(props: ILeaveMasterProps) {
    super(props);
    this.state = {
      leaveItems: [],
      loading: true,
    };
  }

  // Event handler for form submission
 

  // Fetch data from SharePoint list
  private fetchItems = async (): Promise<void> => {
    try {
      if (!this.props.context) {
        throw new Error('SPFx context is not available.');
      }

      const sp = spfi().using(SPFx(this.props.context)); // Ensure we are using SPFx context correctly

      // Fetch leave items from SharePoint list
      const leaveItems: ILeaveItem[] = await sp.web.lists
        .getByTitle('leaves_master')
        .items.select('Id', 'Title', 'leave_type', 'leave_date', 'aproval')(); // Specify the fields to retrieve
      
      // Set the fetched items and loading state
      this.setState({ leaveItems, loading: false });
    } catch (error) {
      console.error('Error fetching items:', error);
      this.setState({ loading: false });
    }
  };

  async componentDidMount(): Promise<void> {
    console.log('SPFx Context:', this.props.context); // Debugging step
    await this.fetchItems(); // Await the promise to ensure proper handling
  }

  public render(): React.ReactElement<ILeaveMasterProps> {
    const { hasTeamsContext, context } = this.props;
    const { leaveItems, loading } = this.state;

    return (
      <HashRouter>
        <section className={`${styles.leaveMaster} ${hasTeamsContext ? styles.teams : ''}`}>
          <div className={styles.buttonContainer}> {/* Container for positioning */}
            {/* Get Data Button */}
            <a href="/sites/Ashim_Team_Site/_layouts/15/workbench.aspx#/data-page">
  Get Data
</a>

           /    <a href="/sites/Ashim_Team_Site/_layouts/15/workbench.aspx/"> {"   "} 
Home
</a>
          </div>

          <h1>Leave Management</h1>
          {/* Route setup */}
          <Routes>
            <Route
              path="/"
              element={<LeaveForm context={context} />}
            />
            <Route
              path="/data-page"
              element={<LeaveData leaveItems={leaveItems} loading={loading} />}
            />
            <Route
              path="/:id"
              element={<LeaveDataPage context={context} />}
            />
          </Routes>
        </section>
      </HashRouter>
    );
  }
}
