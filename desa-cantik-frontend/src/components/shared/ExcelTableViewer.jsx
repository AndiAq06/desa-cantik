import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Loader2, AlertCircle, Download, Share2 } from "lucide-react";

export default function ExcelTableViewer({ fileUrl, title, leftActions }) {
  const [tableData, setTableData] = useState(null);
  const [headerRowCount, setHeaderRowCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  useEffect(() => {
    const parseExcel = async () => {
      if (!fileUrl) {
        setError("File URL tidak valid");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error("Gagal mengunduh file spreadsheet");
        }

        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        if (workbook.SheetNames.length === 0) {
          throw new Error("Spreadsheet tidak memiliki sheet aktif");
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        if (!worksheet['!ref']) {
          throw new Error("Sheet tidak memiliki range data");
        }

        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const merges = worksheet['!merges'] || [];

        const mergeMap = {};
        merges.forEach((m) => {
          for (let r = m.s.r; r <= m.e.r; r++) {
            for (let c = m.s.c; c <= m.e.c; c++) {
              if (r === m.s.r && c === m.s.c) {
                mergeMap[`${r},${c}`] = {
                  isStart: true,
                  rowspan: m.e.r - m.s.r + 1,
                  colspan: m.e.c - m.s.c + 1,
                };
              } else {
                mergeMap[`${r},${c}`] = { isCovered: true };
              }
            }
          }
        });

        const parsedRows = [];
        for (let r = range.s.r; r <= range.e.r; r++) {
          const rowCells = [];
          let isRowEmpty = true;

          for (let c = range.s.c; c <= range.e.c; c++) {
            const cellRef = XLSX.utils.encode_cell({ r, c });
            const cellObj = worksheet[cellRef];
            const val = cellObj ? (cellObj.w !== undefined ? cellObj.w : cellObj.v) : "";

            if (val !== "" && val !== undefined && val !== null) {
              isRowEmpty = false;
            }

            const mergeInfo = mergeMap[`${r},${c}`];
            rowCells.push({ r, c, value: val, mergeInfo });
          }

          parsedRows.push({ rowIndex: r, cells: rowCells, isRowEmpty });
        }

        const getExcelColumnName = (index) => {
          let name = "";
          let temp = index;
          while (temp >= 0) {
            name = String.fromCharCode((temp % 26) + 65) + name;
            temp = Math.floor(temp / 26) - 1;
          }
          return name;
        };

        let excelLettersRowIdx = -1;
        for (let r = 0; r < Math.min(3, parsedRows.length); r++) {
          const row = parsedRows[r];
          let matchCount = 0;
          let totalNonEmpty = 0;
          row.cells.forEach((cell, cIdx) => {
            const val = cell.value?.toString().trim().toUpperCase() || "";
            if (val) {
              totalNonEmpty++;
              if (val === getExcelColumnName(cIdx) || val === getExcelColumnName(cIdx - 1)) {
                matchCount++;
              }
            }
          });
          if (matchCount >= 3 && matchCount / totalNonEmpty > 0.8) {
            excelLettersRowIdx = r;
            break;
          }
        }

        let excelNumbersColIdx = -1;
        if (parsedRows.length > 0) {
          const colsToCheck = Math.min(3, parsedRows[0].cells.length);
          for (let c = 0; c < colsToCheck; c++) {
            const colValues = parsedRows.map(r => r.cells[c]?.value?.toString().trim() || "");
            let firstOneIdx = -1;
            for (let i = 0; i < colValues.length; i++) {
              if (colValues[i] === "1") { firstOneIdx = i; break; }
            }
            if (firstOneIdx !== -1) {
              let currentExpected = 1;
              let isSequential = true;
              let matchSeqCount = 0;
              for (let i = firstOneIdx; i < colValues.length; i++) {
                const val = colValues[i];
                if (val === "") continue;
                const num = parseInt(val, 10);
                if (isNaN(num)) break;
                if (num === currentExpected) { matchSeqCount++; currentExpected++; }
                else { isSequential = false; break; }
              }
              if (isSequential && matchSeqCount >= 3) { excelNumbersColIdx = c; break; }
            }
          }
        }

        if (excelLettersRowIdx !== -1) parsedRows.splice(excelLettersRowIdx, 1);
        if (excelNumbersColIdx !== -1) parsedRows.forEach(row => row.cells.splice(excelNumbersColIdx, 1));

        while (parsedRows.length > 0) {
          const lastRow = parsedRows[parsedRows.length - 1];
          const isRowEmpty = lastRow.cells.every(cell => {
            const val = cell.value?.toString().trim();
            return val === "" || val === undefined || val === null;
          });
          if (isRowEmpty) parsedRows.pop();
          else break;
        }

        if (parsedRows.length > 0) {
          let numCols = parsedRows[0].cells.length;
          while (numCols > 0) {
            const colIdx = numCols - 1;
            const isColEmpty = parsedRows.every(row => {
              const cell = row.cells[colIdx];
              const val = cell ? cell.value?.toString().trim() : "";
              return val === "" || val === undefined || val === null;
            });
            if (isColEmpty) {
              parsedRows.forEach(row => { if (row.cells.length > colIdx) row.cells.pop(); });
              numCols--;
            } else break;
          }
        }

        let calculatedHeaderRowCount = 1;
        for (let r = 0; r < Math.min(5, parsedRows.length); r++) {
          const row = parsedRows[r];
          let hasMerge = false;
          let numericCount = 0;
          let textCount = 0;
          row.cells.forEach(cell => {
            if (cell.mergeInfo && (cell.mergeInfo.colspan > 1 || cell.mergeInfo.rowspan > 1)) hasMerge = true;
            const val = cell.value?.toString().trim() || "";
            if (val !== "") {
              const cleanVal = val.replace(/[\.,\-]/g, "");
              if (cleanVal && !isNaN(cleanVal)) numericCount++;
              else if (val !== "-") textCount++;
            }
          });
          if (hasMerge) calculatedHeaderRowCount = r + 1;
          else if (numericCount > 0 && numericCount >= textCount) { calculatedHeaderRowCount = r; break; }
          else calculatedHeaderRowCount = r + 1;
        }
        calculatedHeaderRowCount = Math.max(1, Math.min(calculatedHeaderRowCount, parsedRows.length));
        setHeaderRowCount(calculatedHeaderRowCount);
        setTableData(parsedRows);
      } catch (err) {
        console.error("Excel parse error:", err);
        setError(err.message || "Gagal mengurai file Excel");
      } finally {
        setLoading(false);
      }
    };

    parseExcel();
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#154D71]" />
        <span className="text-xs">Mengonversi tabel Excel...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2 bg-red-50/50 rounded-xl p-4 border border-red-100">
        <AlertCircle className="h-8 w-8" />
        <span className="text-sm font-semibold">{error}</span>
        <span className="text-xs text-slate-500 text-center max-w-md">
          Pastikan format file berupa Excel (.xlsx) yang valid dan tidak terenkripsi/rusak.
        </span>
      </div>
    );
  }

  const handleDownloadExcel = () => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    const cleanTitle = title ? title.replace(/[\/\\?%*:|"<>\s]+/g, "_") : "data_statistik";
    link.setAttribute("download", `${cleanTitle}.xlsx`);
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!tableData || tableData.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        Tidak ada data untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">

        {/* TOMBOL BAGIKAN — sebelah kiri */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {copied ? "Link disalin!" : "Bagikan"}
        </button>

        {/* TOMBOL UNDUH — sebelah kanan */}
        <button
          onClick={handleDownloadExcel}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4eaf47] hover:bg-[#439e3d] text-white rounded-lg transition-colors text-sm font-semibold shadow-sm"
        >
          <Download className="w-4 h-4" />
          Unduh Excel (.xlsx)
        </button>

      </div>
      <div className="w-full overflow-x-auto shadow-sm border border-slate-200 rounded-xl bg-white p-1">
        <table className="w-full border-collapse text-base text-slate-700 bg-white">
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr
                key={row.rowIndex}
                className={`hover:bg-slate-50/50 transition-colors ${rowIndex < headerRowCount ? "" : rowIndex % 2 === 0 ? "bg-slate-50/30" : ""
                  }`}
              >
                {row.cells.map((cell, cellIndex) => {
                  if (cell.mergeInfo?.isCovered) return null;
                  const colSpan = cell.mergeInfo?.colspan || 1;
                  const rowSpan = cell.mergeInfo?.rowspan || 1;
                  const isHeader = rowIndex < headerRowCount;
                  const baseClass = "border border-slate-200 px-3 py-2 text-center align-middle";
                  let cellClass = baseClass;
                  if (isHeader) {
                    cellClass = "bg-[#154D71] text-white border border-[#236691] font-bold px-3 py-2.5 text-center align-middle";
                  } else {
                    if (cellIndex === 0) cellClass += " text-left font-medium text-slate-800";
                  }
                  return (
                    <td key={cellIndex} colSpan={colSpan} rowSpan={rowSpan} className={cellClass}>
                      {cell.value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}