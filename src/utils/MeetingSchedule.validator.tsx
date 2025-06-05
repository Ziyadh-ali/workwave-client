import * as Yup from "yup"
import dayjs from 'dayjs';

export const meetingScheduleSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),

  duration: Yup.number()
    .typeError('Duration must be a number')
    .required('Duration is required')
    .positive('Duration must be a positive number'),

  startTime: Yup.string()
    .required('Start time is required'),

  date: Yup.string()
    .required('Date is required')
    .test('not-in-past', 'Date and time must not be in the past', function (value) {
      const { startTime } = this.parent;
      if (!value || !startTime) return false;

      const dateTime = dayjs(`${value}T${startTime}`);
      return dateTime.isAfter(dayjs());
    }),

  role: Yup.string()
    .nullable(),

  department: Yup.string()
    .nullable(),

  description: Yup.string()
    .required('Description is required')
    .min(5, 'Description must be at least 5 characters'),

}).test('role-or-department', 'Select either a role or a department, not both', function (value) {
  const { role, department } = value;

  if (!role && !department) {
    return this.createError({ path: 'role', message: 'Either role or department is required' });
  }

  if (role && department) {
    return this.createError({ path: 'role', message: 'Select either role or department, not both' });
  }

  return true;
});
