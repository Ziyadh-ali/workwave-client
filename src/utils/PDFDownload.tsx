import { downloadPayslipService } from "../services/user/userService";


export const downloadPayslip = async (
  employeeId: string,
  month: number,
  year: number
): Promise<Blob> => {
  const response = await downloadPayslipService(employeeId , month , year);

  return response;
};
