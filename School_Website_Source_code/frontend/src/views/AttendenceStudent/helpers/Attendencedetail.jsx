import React from "react";
import { Table } from "reactstrap";
import { get_rombo_week } from "@src/utility/Utils";
import { LEGEND, STATUS_CELL_COLOR } from "./Constants";

export default function AttendanceDetail({
  sessions,
  selectedWeek,
  attendance,
}) {
  const selectedWeekInt = selectedWeek ? parseInt(selectedWeek) : null;
  const rombos = get_rombo_week() ?? [];
  const ttList = Array.isArray(sessions) ? sessions : [];

  return (
    <div style={{ padding: "12px" }}>
      {/* Тайлбар */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          fontSize: "12px",
          marginBottom: "10px",
        }}
      >
        {LEGEND.map(({ status, label, bg }) => (
          <div
            key={status}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: bg,
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "11px",
              }}
            >
              {status}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {ttList.map((tt, ttIdx) => {
        // week_ids хоосон бол weeks-аас авах
        const weekIds =
          Array.isArray(tt?.week_ids) && tt.week_ids.length > 0
            ? tt.week_ids
            : (tt?.weeks ?? []).map((w) => w.week);

        const uniqueWeekIds = [...new Set(weekIds)].sort((a, b) => a - b);

        // ирцийн map
        const weeksMap = {};
        (tt?.weeks ?? []).forEach((w) => {
          weeksMap[w.week] = w.state_name;
        });

        const label = `${tt?.type ?? ""} — ${tt?.day ?? ""} дахь өдөр, ${
          tt?.time ?? ""
        } дахь цаг`;

        if (uniqueWeekIds.length === 0) {
          return (
            <div
              key={ttIdx}
              style={{
                marginBottom: "14px",
                padding: "8px",
                background: "#f5f5f5",
                borderRadius: "4px",
              }}
            >
              {label}
              <div
                style={{ marginTop: "6px", fontStyle: "italic", color: "#999" }}
              >
                Ирцийн мэдээлэл байхгүй
              </div>
            </div>
          );
        }

        return (
          <div key={ttIdx} style={{ marginBottom: "14px" }}>
            <div
              style={{
                backgroundColor: "#ffe0b2",
                padding: "8px 12px",
                marginBottom: "6px",
                borderRadius: "4px",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              {label}
            </div>
            <div style={{ overflow: "auto" }}>
              <Table
                bordered
                size="sm"
                style={{ fontSize: "12px", marginBottom: 0, minWidth: "400px" }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#ffe0b2" }}>
                    {uniqueWeekIds.map((wid, wIdx) => {
                      const weekLabel =
                        rombos.find((r) => r?.id === wid)?.name ?? wid;
                      const isSelected = selectedWeekInt === wid;
                      return (
                        <th
                          key={wIdx}
                          className="text-center"
                          style={{
                            minWidth: "45px",
                            fontSize: "11px",
                            backgroundColor: isSelected ? "#ffb74d" : "#ffe0b2",
                            fontWeight: isSelected ? "bold" : "normal",
                          }}
                        >
                          {weekLabel}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {uniqueWeekIds.map((wid, wIdx) => {
                      const status = weeksMap[wid] ?? "-";
                      const isSelected = selectedWeekInt === wid;
                      return (
                        <td
                          key={wIdx}
                          className="text-center"
                          style={{
                            backgroundColor:
                              STATUS_CELL_COLOR[status] ?? "#f5f5f5",
                            fontWeight: "bold",
                            fontSize: "13px",
                            outline: isSelected ? "2px solid #ff9800" : "none",
                            position: isSelected ? "relative" : "static",
                            zIndex: isSelected ? 1 : "auto",
                          }}
                        >
                          {status}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
