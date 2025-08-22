# Employee Scheduling Feature

## Overview
The scheduling feature allows users to create and manage employee schedules with a visual grid interface. Users can view schedules in both day and week views, create new schedules by clicking on time cells, and edit existing schedules.

## Features

### Grid View
- **Day View**: Shows a single day with hourly time slots from 6 AM to 10 PM
- **Week View**: Shows 7 days (Monday to Sunday) with hourly time slots
- **Clickable Cells**: Click on any time cell to create a new schedule
- **Visual Schedule Display**: Existing schedules are highlighted in blue with employee names and times

### Schedule Management
- **Create Schedule**: Click on a time cell to open the schedule creation modal
- **Edit Schedule**: Click on an existing schedule to edit it
- **Delete Schedule**: Delete schedules through the edit modal
- **Employee Selection**: Choose from active employees in the store
- **Time Range**: Set start and end times for each schedule
- **Notes**: Add optional notes to schedules

### Navigation
- **Date Navigation**: Navigate between days/weeks using arrow buttons
- **Today Button**: Quick navigation to today's date
- **View Toggle**: Switch between day and week views

## API Endpoints

The scheduling feature uses the following API endpoints:

- `GET /schedules?startDate={date}&endDate={date}` - Get schedules for a date range
- `GET /employees/{id}/schedules?startDate={date}&endDate={date}` - Get schedules for a specific employee
- `POST /schedules` - Create a new schedule
- `PUT /schedules/{id}` - Update an existing schedule
- `DELETE /schedules/{id}` - Delete a schedule
- `GET /schedules/{id}` - Get a specific schedule

## Data Models

### Schedule
```typescript
interface Schedule {
  scheduleid: string;
  storenumber: number;
  employeeid: string;
  employee: {
    firstname: string;
    lastname: string;
    email: string;
  };
  startdatetime: string;
  enddatetime: string;
  createdby: string;
  creator: {
    firstname: string;
    lastname: string;
    email: string;
  };
  createdon: string;
  notes?: string;
}
```

## Usage

1. Navigate to the Schedule page from the sidebar
2. Choose between Day or Week view using the toggle buttons
3. Navigate to the desired date using the arrow buttons or "Today" button
4. Click on any time cell to create a new schedule
5. Select an employee, set start/end times, and add optional notes
6. Click "Create" to save the schedule
7. Click on existing schedules to edit or delete them

## Technical Implementation

- **React Hooks**: Uses useState and useEffect for state management
- **TypeScript**: Fully typed interfaces and components
- **Tailwind CSS**: Responsive styling with hover effects
- **API Integration**: RESTful API calls with error handling
- **Modal Components**: Reusable modal for schedule creation/editing
- **Date Handling**: Comprehensive date manipulation and formatting 