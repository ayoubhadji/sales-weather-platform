import { Fragment, useEffect, useMemo, useState } from "react";
import { Receipt, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import api from "../../services/api";
import { card, colors } from "../../styles/common";
import type { SalesTicket } from "../../types/SalesTicket";
import type { FranchiseStats } from "../../types/FranchiseStats";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function Sales() {
  const [sales, setSales] = useState<SalesTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedFranchise, setSelectedFranchise] = useState("");
  const [franchises, setFranchises] = useState<FranchiseStats[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    void loadSales();
    void loadFranchises();
  }, []);

  async function loadFranchises() {
    try {
      const response = await api.get("/users/franchises");
      setFranchises(response.data);
    } catch (error) {
      console.error("Error loading franchises:", error);
    }
  }

  async function loadSales() {
    try {
      const response = await api.get("/sales-ticket");
      setSales(response.data);
    } catch (error) {
      console.error("Error loading admin sales:", error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return sales.filter((sale) => {
      if (search && !sale.ticketNumber.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      const saleDate = new Date(sale.saleDate);

      if (startDate && saleDate < new Date(startDate)) return false;
      if (endDate && saleDate > new Date(`${endDate}T23:59:59`)) return false;

      const amount = Number(sale.totalAmount);
      if (minAmount && amount < Number(minAmount)) return false;
      if (maxAmount && amount > Number(maxAmount)) return false;

      // Assumes the ticket carries its franchise via a `user` relation, same
      // as the backend's reports queries (`ticket.user`). Adjust the field
      // name below if your SalesTicket type exposes it differently.
      if (selectedFranchise) {
        const franchiseId = (sale as any).user?.id ?? (sale as any).franchiseId;
        if (String(franchiseId) !== selectedFranchise) return false;
      }

      return true;
    });
  }, [sales, search, startDate, endDate, minAmount, maxAmount, selectedFranchise]);

  // Reset to page 1 whenever the filters or page size change, so you never
  // land on an empty page after narrowing the results.
  useEffect(() => {
    setPage(1);
  }, [search, startDate, endDate, minAmount, maxAmount, selectedFranchise, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const hasActiveFilters = Boolean(
    search || startDate || endDate || minAmount || maxAmount || selectedFranchise,
  );

  function resetFilters() {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setSelectedFranchise("");
  }

  return (
    <div>
      <PageHeader
        icon={Receipt}
        title="Sales Tickets"
        description="View all ticket totals and line items captured by the platform."
      />

      {/* Filters */}
      <div style={{ ...card, ...filterCard }}>
        <div style={filterGrid}>
          <div>
            <label style={labelStyle}>Ticket number</label>
            <div style={searchWrap}>
              <Search size={16} color={colors.textMuted} style={searchIcon} />
              <input
                type="text"
                placeholder="e.g. TCK-0043"
                style={{ ...inputStyle, paddingLeft: 36 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Franchise</label>
            <select
              style={inputStyle}
              value={selectedFranchise}
              onChange={(e) => setSelectedFranchise(e.target.value)}
            >
              <option value="">All Franchises</option>
              {franchises.map((franchise) => (
                <option key={franchise.id} value={franchise.id}>
                  {franchise.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>From</label>
            <input
              type="date"
              style={inputStyle}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>To</label>
            <input
              type="date"
              style={inputStyle}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Min amount (DT)</label>
            <input
              type="number"
              placeholder="0"
              style={inputStyle}
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Max amount (DT)</label>
            <input
              type="number"
              placeholder="No limit"
              style={inputStyle}
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <div style={filterFooter}>
            <span style={resultsPill}>
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
            <button style={ghostButton} onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        {loading ? (
          <LoadingRows />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilter={hasActiveFilters} />
        ) : (
          <>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 36 }}></th>
                  <th style={thStyle}>Ticket Number</th>
                  <th style={thStyle}>Sale Date</th>
                  <th style={thStyle}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((sale) => {
                  const isExpanded = expandedTicket === sale.id;
                  return (
                    <Fragment key={sale.id}>
                      <tr
                        style={rowStyle}
                        onClick={() => setExpandedTicket(isExpanded ? null : sale.id)}
                      >
                        <td style={tdStyle}>
                          {isExpanded ? (
                            <ChevronUp size={16} color={colors.textMuted} />
                          ) : (
                            <ChevronDown size={16} color={colors.textMuted} />
                          )}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: colors.dark }}>
                          {sale.ticketNumber}
                        </td>
                        <td style={{ ...tdStyle, color: colors.textMuted }}>
                          {new Date(sale.saleDate).toLocaleString()}
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: colors.dark }}>
                          {sale.totalAmount} DT
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={4} style={expandedCellStyle}>
                            <table style={nestedTableStyle}>
                              <thead>
                                <tr>
                                  <th style={nestedThStyle}>Product</th>
                                  <th style={nestedThStyle}>Quantity</th>
                                  <th style={nestedThStyle}>Unit Price</th>
                                  <th style={nestedThStyle}>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sale.items.length > 0 ? (
                                  sale.items.map((item) => (
                                    <tr key={item.id}>
                                      <td style={tdStyle}>{item.product.name}</td>
                                      <td style={tdStyle}>{item.quantity}</td>
                                      <td style={tdStyle}>{item.unitPrice} DT</td>
                                      <td style={tdStyle}>{item.subtotal} DT</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4} style={emptyCellStyle}>
                                      No items found for this ticket.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={paginationBar}>
              <div style={pageSizeWrap}>
                <span style={{ color: colors.textMuted, fontSize: 13 }}>Rows per page</span>
                <select
                  style={pageSizeSelect}
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div style={pageControls}>
                <span style={{ color: colors.textMuted, fontSize: 13 }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  style={{
                    ...pageButton,
                    opacity: currentPage === 1 ? 0.4 : 1,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  style={{
                    ...pageButton,
                    opacity: currentPage === totalPages ? 0.4 : 1,
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <div style={{ padding: 24 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            height: 44,
            borderRadius: 8,
            background: "#f1f5f9",
            marginBottom: 12,
            opacity: 1 - i * 0.12,
          }}
        />
      ))}
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div style={emptyState}>
      <Receipt size={32} color={colors.textMuted} />
      <p style={{ margin: 0, fontWeight: 600, color: colors.dark }}>
        {hasFilter ? "No tickets match your filters" : "No sales tickets found"}
      </p>
      <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>
        {hasFilter
          ? "Try a different date range or ticket number."
          : "Tickets will show up here once sales come in."}
      </p>
    </div>
  );
}

const filterCard: React.CSSProperties = {
  marginBottom: 24,
  padding: 24,
};

const filterGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 24,
  rowGap: 20,
};

const filterFooter: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 16,
  paddingTop: 16,
  borderTop: `1px solid ${colors.border}`,
};

const resultsPill: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: colors.textMuted,
  background: "#f3f4f6",
  padding: "6px 12px",
  borderRadius: 999,
};

const ghostButton: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: colors.textMuted,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  padding: "6px 8px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontWeight: 600,
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  boxSizing: "border-box",
};

const searchWrap: React.CSSProperties = {
  position: "relative",
};

const searchIcon: React.CSSProperties = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  background: "#f8fafc",
  borderBottom: `1px solid ${colors.border}`,
  fontSize: 13,
  color: colors.textMuted,
  fontWeight: 600,
};

const nestedThStyle: React.CSSProperties = {
  ...thStyle,
  background: "#eef2f7",
};

const rowStyle: React.CSSProperties = {
  cursor: "pointer",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: `1px solid ${colors.border}`,
  fontSize: 14,
};

const nestedTableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#f8fafc",
};

const expandedCellStyle: React.CSSProperties = {
  padding: 0,
  borderBottom: `1px solid ${colors.border}`,
};

const emptyCellStyle: React.CSSProperties = {
  padding: 18,
  textAlign: "center",
  color: colors.textMuted,
};

const emptyState: React.CSSProperties = {
  padding: "48px 24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  textAlign: "center",
};

const paginationBar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 16,
  padding: "14px 16px",
  borderTop: `1px solid ${colors.border}`,
};

const pageSizeWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const pageSizeSelect: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  fontSize: 13,
};

const pageControls: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const pageButton: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  background: "#fff",
};

export default Sales;