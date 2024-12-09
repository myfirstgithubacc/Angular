export const items: any[] = [
    // {
    //     text: 'Hiring',
    //     items: [{ text: 'Requests' }, { text: 'Bids'}]
    // },
    // {
    //     text: 'CLP',
    //     items: [{ text: 'CLP Info' }, { text: 'Extension/Adjustment' }, { text: 'Talent' },{ text: 'Mass Update' }]
    // },
    // {
    //     text: 'Acrotrac',
    //     items: [{ text: 'Timesheets & Expenses' }, { text: 'Upload Utilities' }, { text: 'XRM Clocks' }]
    // },
    // {
    //     text: 'Requisitions'
    // },
    // {
    //     text: 'CLP/Contractor'
    // },
    // {
    //     text: 'Time and Expenses'
    // },
    // {
    //     text: 'SOWs'
    // },
    // {
    //     text: 'CLP Training'
    // },
    {
        text: 'Administration',
        items: [
            { text: 'Requisition Library', path: '/administration/requisition-list' },
            // { text: 'Requisition Library Old',path:'/administration/requisition-list-review' }, 
            { text: 'Business Unit', path: '/administration/business-unit' },
            { text: 'Configure Client', path: '/administration/configure-clients' },
            { text: 'Labor Category', path: '/administration/labor-category' },
            { text: 'Job Category', path: '/administration/job-category' },
            { text: 'Role', path: '/administration/user-group' },
            {
                text: 'Organization Level',
                items: [
                        { text: "Organization Level 1", path: '/administration/organization-level' }, 
                        { text: "Organization Level 2", path: '/administration/organization-level/list-org2'  }
                    ],
            },
            { text: 'Manage Users', path: '/administration/manage-users' }
        ]
    }

];