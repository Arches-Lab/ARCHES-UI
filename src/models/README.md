# Models

This folder contains TypeScript interfaces used throughout the application.

## Interfaces

### Task
Represents a task in the system.
- `taskid`: Unique identifier for the task
- `storenumber`: Store number associated with the task
- `taskname`: Name/description of the task
- `taskdescription`: Optional detailed description
- `taskstatus`: Current status of the task (e.g., 'OPEN', 'PENDING', 'COMPLETED')
- `assignedto`: Employee ID assigned to the task
- `assignee`: Object containing assignee details (firstname, lastname, email)
- `createdby`: User ID who created the task
- `creator`: Object containing creator details (firstname, lastname, email)
- `createdon`: Timestamp when the task was created

### Employee
Represents an employee in the system.
- `employeeid`: Unique identifier for the employee
- `firstname`: Employee's first name
- `lastname`: Employee's last name
- `email`: Employee's email address
- `role`: Optional role/position
- `active`: Whether the employee is active

### Activity
Represents an activity/note associated with a lead, mailbox, or task.
- `activityid`: Unique identifier for the activity
- `storenumber`: Store number associated with the activity
- `parentid`: ID of the parent entity (lead, mailbox, or task)
- `parenttypecode`: Type of parent ('LEAD', 'MAILBOX', 'TASK')
- `activitytypecode`: Type of activity (e.g., 'CALL', 'EMAIL', 'NOTE')
- `details`: Activity details/description
- `createdby`: User ID who created the activity
- `creator`: Object containing creator details (firstname, lastname, email)
- `createdon`: Timestamp when the activity was created

### Lead
Represents a lead in the system.
- `leadid`: Unique identifier for the lead
- `storenumber`: Store number associated with the lead
- `description`: Lead description
- `contactname`: Contact person's name
- `phone`: Contact phone number
- `email`: Contact email address
- `createdby`: User ID who created the lead
- `creator`: Object containing creator details (firstname, lastname, email)
- `createdon`: Timestamp when the lead was created
- `assignedto`: Employee ID assigned to the lead
- `assigned`: Object containing assignee details (firstname, lastname, email)
- `status`: Current status of the lead

## Usage

Import interfaces from the models folder:

```typescript
import { Task, Employee, Activity, Lead } from '../models';
```

Or import individual interfaces:

```typescript
import { Task } from '../models/Task';
import { Employee } from '../models/Employee';
``` 