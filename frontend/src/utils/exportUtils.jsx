import * as XLSX from "xlsx";

export const exportToExcel = (data, fileName = "transactions") => {
  if (!data || data.length === 0) {
    alert("No data to export!");
    return;
  }

  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, `${fileName}.xlsx`,{
     bookType: 'xlsx',
     type: 'array'
    });
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Error exporting date. Please try again.")
  }
};
