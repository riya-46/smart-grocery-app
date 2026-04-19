import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const MODES = ["Family", "Party", "Guest", "Festival"];
const PIE_COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444"];
const PIE_OUTER_RADIUS = 118;
const PIE_INNER_RADIUS = 54;
const PIE_LABEL_RADIAN = Math.PI / 180;
const MAX_VISIBLE_ITEMS = 5;

function Home() {
  const apiBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const API_URL = `${
    apiBaseUrl ||
    (window.location.hostname === "localhost" ? "http://localhost:5000" : "")
  }/api/groceries`;
  const navigate = useNavigate();
  const rupeeSymbol = "\u20B9";
  const authToken = localStorage.getItem("smartgrocery_token") || "";
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("smartgrocery_user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [mode, setMode] = useState("Family");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");

  const [items, setItems] = useState([]);
  const [listMode, setListMode] = useState("Family");
  const [pieView, setPieView] = useState("Daily");
  const [graphView, setGraphView] = useState("Daily");
  const pieBoxRef = useRef(null);
  const lineBoxRef = useRef(null);
  const itemListRef = useRef(null);
  const itemFormSectionRef = useRef(null);
  const itemListSectionRef = useRef(null);
  const modeChartSectionRef = useRef(null);
  const totalGraphSectionRef = useRef(null);
  const [pieBoxSize, setPieBoxSize] = useState({ width: 0, height: 0 });
  const [lineBoxWidth, setLineBoxWidth] = useState(0);
  const [itemListMaxHeight, setItemListMaxHeight] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [dataRefreshTick, setDataRefreshTick] = useState(0);

  const [username] = useState(currentUser?.name || "User");
  const activeMode = listMode === "All" ? mode : listMode;

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString("en-GB");
  };

  const isSameDate = (date1, date2) => {
    return formatDate(date1) === formatDate(date2);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const selectedDay = selectedDate.getDate();
  const selectedMonthIndex = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  const selectedMonthName = monthNames[selectedMonthIndex];
  const daysInSelectedMonth = new Date(
    selectedYear,
    selectedMonthIndex + 1,
    0
  ).getDate();
  const dayOptions = Array.from(
    { length: daysInSelectedMonth },
    (_, index) => index + 1
  );
  const yearOptions = Array.from({ length: 11 }, (_, index) => 2021 + index);

  const getModeClass = (value) => {
    switch (value) {
      case "Family":
        return "mode-family";
      case "Party":
        return "mode-party";
      case "Guest":
        return "mode-guest";
      case "Festival":
        return "mode-festival";
      default:
        return "";
    }
  };

  const scrollToSection = (sectionRef) => {
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
    setListMode(selectedMode);
    scrollToSection(itemFormSectionRef);
  };

  const handleListModeChange = (selectedMode) => {
    setListMode(selectedMode);

    if (selectedMode !== "All") {
      setMode(selectedMode);
    }
  };

  const handleCalendarPartChange = (part, value) => {
    const nextDay = part === "day" ? Number(value) : selectedDay;
    const nextMonth =
      part === "month" ? Number(value) : selectedDate.getMonth();
    const nextYear = part === "year" ? Number(value) : selectedYear;
    const maxDay = new Date(nextYear, nextMonth + 1, 0).getDate();
    const safeDay = Math.min(nextDay, maxDay);

    setSelectedDate(new Date(nextYear, nextMonth, safeDay));
  };

  const handleLogout = () => {
    const shouldLogout = window.confirm("Are you sure you want to logout?");

    if (!shouldLogout) {
      return;
    }

    localStorage.removeItem("smartgrocery_token");
    localStorage.removeItem("smartgrocery_user");
    navigate("/");
  };

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }),
    [authToken]
  );

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!itemName || !quantity || !unit || !price) {
      alert("Please fill all fields");
      return;
    }

    try {
      if (!authToken) {
        alert("Please login again");
        navigate("/");
        return;
      }

      const newItem = {
        itemName: itemName.trim(),
        quantity: Number(quantity),
        unit,
        price: Number(price),
        mode: activeMode,
        selectedDate: formatDate(selectedDate),
      };

      const response = await axios.post(API_URL, newItem, authConfig);

      setItems((prev) => [response.data, ...prev]);

      setItemName("");
      setQuantity("");
      setUnit("");
      setPrice("");
      scrollToSection(itemListSectionRef);
    } catch (error) {
      console.error("Error adding grocery item:", error);
      alert("Failed to add item");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, authConfig);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting grocery item:", error);
      alert("Failed to delete item");
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setEditName(item.itemName);
    setEditQuantity(item.quantity);
    setEditPrice(item.price);
  };

  const handleSaveEdit = async (id) => {
    if (!editName || !editQuantity || !editPrice) {
      alert("Please fill all edit fields");
      return;
    }

    try {
      if (!authToken) {
        alert("Please login again");
        navigate("/");
        return;
      }

      const updatedItem = {
        itemName: editName.trim(),
        quantity: Number(editQuantity),
        price: Number(editPrice),
      };

      const response = await axios.put(`${API_URL}/${id}`, updatedItem, authConfig);

      setItems((prev) =>
        prev.map((item) => (item._id === id ? response.data : item))
      );

      setEditingId(null);
      setEditName("");
      setEditQuantity("");
      setEditPrice("");
    } catch (error) {
      console.error("Error updating grocery item:", error);
      alert("Failed to update item");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditQuantity("");
    setEditPrice("");
  };

  const matchesListMode = (item) => {
    return listMode === "All" ? true : item.mode === listMode;
  };

  const filteredItems = items.filter((item) => {
    const sameDate = item.selectedDate === formatDate(selectedDate);
    const sameMode = matchesListMode(item);
    return sameDate && sameMode;
  });
  const activeListModeLabel = listMode === "All" ? "All modes" : listMode;
  const selectedDateLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [selectedDate]
  );

  const selectedDayTotalExpense = useMemo(
    () =>
      items
        .filter((item) => item.selectedDate === formatDate(selectedDate))
        .reduce((sum, item) => sum + Number(item.price), 0),
    [items, selectedDate]
  );
  const selectedMonthTotalExpense = useMemo(() => {
    return items
      .filter((item) => {
        const [day, month, year] = item.selectedDate.split("/").map(Number);
        const itemDate = new Date(year, month - 1, day);

        return (
          itemDate.getMonth() === selectedMonthIndex &&
          itemDate.getFullYear() === selectedYear
        );
      })
      .reduce((sum, item) => sum + Number(item.price), 0);
  }, [items, selectedMonthIndex, selectedYear]);

  const getExpenseForDate = (date) => {
    const formattedDate = formatDate(date);

    return items
      .filter((item) => {
        if (item.selectedDate !== formattedDate) return false;
        return matchesListMode(item);
      })
      .reduce((sum, item) => sum + Number(item.price), 0);
  };

  const pieData = useMemo(() => {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    const selectedDayValue = formatDate(selectedDate);

    return MODES.map((currentMode) => {
      const total = items
        .filter((item) => {
          if (item.mode !== currentMode) return false;

          if (pieView === "Daily") {
            return item.selectedDate === selectedDayValue;
          }

          const [day, month, year] = item.selectedDate.split("/").map(Number);
          const itemDate = new Date(year, month - 1, day);

          return (
            itemDate.getMonth() === selectedMonth &&
            itemDate.getFullYear() === selectedYear
          );
        })
        .reduce((sum, item) => sum + Number(item.price), 0);

      return {
        name: currentMode,
        value: total,
      };
    });
  }, [items, pieView, selectedDate]);

  const graphData = useMemo(() => {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();

    if (graphView === "Daily") {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

      return Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const currentDate = new Date(selectedYear, selectedMonth, day);
        const formatted = formatDate(currentDate);

        const total = items
          .filter((item) => item.selectedDate === formatted)
          .reduce((sum, item) => sum + Number(item.price), 0);

        return {
          name: day.toString(),
          fullLabel: `${day} ${selectedMonthName} ${selectedYear}`,
          expense: total,
        };
      });
    }

    return [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].map((monthName, monthIndex) => {
      const total = items
        .filter((item) => {
          const [day, month, year] = item.selectedDate.split("/").map(Number);
          const itemDate = new Date(year, month - 1, day);

          return (
            itemDate.getMonth() === monthIndex &&
            itemDate.getFullYear() === selectedYear
          );
        })
        .reduce((sum, item) => sum + Number(item.price), 0);

      return {
        name: monthName,
        expense: total,
      };
    });
  }, [items, graphView, selectedDate, selectedMonthName, selectedYear]);

  const showPieAnnotations = pieBoxSize.width >= 320;
  const pieChartMargin =
    pieBoxSize.width >= 620
      ? { top: 26, right: 80, bottom: 12, left: 80 }
      : pieBoxSize.width >= 420
        ? { top: 22, right: 56, bottom: 10, left: 56 }
        : { top: 18, right: 32, bottom: 8, left: 32 };
  const pieOuterRadius = pieBoxSize.width > 0 && pieBoxSize.width < 420 ? 102 : PIE_OUTER_RADIUS;
  const pieInnerRadius = pieBoxSize.width > 0 && pieBoxSize.width < 420 ? 48 : PIE_INNER_RADIUS;
  const isDailyGraphView = graphView === "Daily";
  const lineChartViewportWidth = Math.max(lineBoxWidth, 320);
  const isLaptopLineChart = lineChartViewportWidth >= 880;
  const lineChartVisibleCount = isLaptopLineChart
    ? Math.max(graphData.length, 1)
    : isDailyGraphView
      ? 6
      : 4;
  const lineChartAxisWidth = isDailyGraphView
    ? lineChartViewportWidth >= 640
      ? 88
      : 76
    : lineChartViewportWidth >= 640
      ? 84
      : 72;
  const lineChartSlotWidth = Math.max(
    isDailyGraphView ? 52 : 72,
    Math.round(
      Math.max(
        lineChartViewportWidth - lineChartAxisWidth,
        isDailyGraphView ? 264 : 288
      ) / lineChartVisibleCount
    )
  );
  const lineChartContentWidth = isLaptopLineChart
    ? lineChartViewportWidth
    : Math.max(
        lineChartViewportWidth,
        lineChartAxisWidth + lineChartSlotWidth * graphData.length
      );
  const isLineChartScrollable =
    !isLaptopLineChart && lineChartContentWidth > lineChartViewportWidth + 4;

  const pieLabels = useMemo(() => {
    const width = pieBoxSize.width;
    const height = pieBoxSize.height;
    const total = pieData.reduce((sum, item) => sum + item.value, 0);

    if (!showPieAnnotations || !width || !height || !total) {
      return [];
    }

    const compactLabels = width < 420;
    const cx = width * 0.5;
    const cy = height * 0.47;
    let currentAngle = 90;

    return pieData
      .filter((item) => item.value > 0)
      .map((item) => {
        const sliceAngle = (item.value / total) * 360;
        const midAngle = currentAngle - sliceAngle / 2;
        currentAngle -= sliceAngle;

        const cos = Math.cos(-midAngle * PIE_LABEL_RADIAN);
        const sin = Math.sin(-midAngle * PIE_LABEL_RADIAN);
        const startX = cx + (pieOuterRadius - 2) * cos;
        const startY = cy + (pieOuterRadius - 2) * sin;
        const lineX = cx + (pieOuterRadius + (compactLabels ? 10 : 16)) * cos;
        const lineY = cy + (pieOuterRadius + (compactLabels ? 10 : 16)) * sin;
        const endX = lineX + (cos >= 0 ? (compactLabels ? 28 : 42) : -(compactLabels ? 28 : 42));
        const endY = lineY;
        const anchor = cos >= 0 ? "start" : "end";
        const textX = endX + (anchor === "start" ? (compactLabels ? 6 : 8) : -(compactLabels ? 6 : 8));

        return {
          key: item.name,
          name: item.name,
          value: item.value,
          compact: compactLabels,
          startX,
          startY,
          lineX,
          lineY,
          endX,
          endY,
          textX,
          anchor,
        };
      });
  }, [pieData, pieBoxSize, pieOuterRadius, showPieAnnotations]);

  useEffect(() => {
    const triggerRefresh = () => {
      setDataRefreshTick((current) => current + 1);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerRefresh();
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        triggerRefresh();
      }
    }, 15000);

    window.addEventListener("focus", triggerRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", triggerRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        if (!authToken) {
          navigate("/");
          return;
        }

        const response = await axios.get(API_URL, authConfig);
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching groceries:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("smartgrocery_token");
          localStorage.removeItem("smartgrocery_user");
          navigate("/");
        }
      }
    };

    fetchGroceries();
  }, [API_URL, authConfig, authToken, dataRefreshTick, navigate]);

  useEffect(() => {
    const node = pieBoxRef.current;
    if (!node) return undefined;

    const updateSize = () => {
      setPieBoxSize({
        width: node.clientWidth,
        height: node.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = lineBoxRef.current;
    if (!node) return undefined;

    const updateSize = () => {
      setLineBoxWidth(node.clientWidth);
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = itemListRef.current;
    if (!node) return undefined;

    const updateVisibleHeight = () => {
      const rows = Array.from(node.children);

      if (rows.length <= MAX_VISIBLE_ITEMS) {
        setItemListMaxHeight(null);
        return;
      }

      const styles = window.getComputedStyle(node);
      const rowGap = Number.parseFloat(styles.rowGap || styles.gap || "0");
      const visibleHeight = rows
        .slice(0, MAX_VISIBLE_ITEMS)
        .reduce((sum, row) => sum + row.getBoundingClientRect().height, 0);

      setItemListMaxHeight(
        Math.ceil(visibleHeight + rowGap * (MAX_VISIBLE_ITEMS - 1) + 4)
      );
    };

    const frameId = window.requestAnimationFrame(updateVisibleHeight);
    const observer = new ResizeObserver(updateVisibleHeight);

    observer.observe(node);
    Array.from(node.children)
      .slice(0, MAX_VISIBLE_ITEMS)
      .forEach((row) => observer.observe(row));

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [filteredItems, editingId]);

  return (
    <div className="home-page">
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="header-top-row">
            <div className="header-copy">
              <h1 className="dashboard-title">
                <span className="title-line">Smart Grocery</span>
                <span className="title-line">Management</span>
              </h1>
            </div>

            <div className="header-actions">
              <div className="user-panel">
                <strong className="username-value">{username}</strong>
              </div>
              <button
                type="button"
                className="logout-btn header-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>

          <p className="header-description">Track groceries with less friction.</p>
        </header>

        <section className="mode-toolbar">
          <div className="mode-toolbar-copy">
            <h2>Choose the grocery mode you are managing now.</h2>
          </div>

          <div className="mode-section" role="tablist" aria-label="Grocery modes">
            {MODES.map((currentMode) => (
              <button
                key={currentMode}
                type="button"
                className={`mode-btn ${getModeClass(currentMode)} ${
                  mode === currentMode ? "active" : ""
                }`}
                onClick={() => handleModeChange(currentMode)}
              >
                {currentMode}
              </button>
            ))}
          </div>
        </section>

        <section className="expense-overview" aria-label="All mode expense overview">
          <article className="overview-card card">
            <span className="overview-label">All Modes</span>
            <h3>Total daily expense</h3>
            <strong className="overview-value">
              {rupeeSymbol}
              {selectedDayTotalExpense.toFixed(2)}
            </strong>
            <p>{selectedDateLabel}</p>
          </article>

          <button
            type="button"
            className="ai-feature-card overview-ai-card card"
            onClick={() => navigate("/ai")}
          >
            <div className="ai-feature-top">
              <div className="ai-icon">AI</div>
              <span className="ai-arrow" aria-hidden="true">
                Open
              </span>
            </div>
            <div className="ai-feature-content">
              <h2>Healthy food items and recipes suggestions</h2>
            </div>
          </button>

          <article className="overview-card card">
            <span className="overview-label">All Modes</span>
            <h3>Total monthly expense</h3>
            <strong className="overview-value">
              {rupeeSymbol}
              {selectedMonthTotalExpense.toFixed(2)}
            </strong>
            <p>
              {selectedMonthName} {selectedYear}
            </p>
          </article>
        </section>

        <section className="workspace-grid">
          <div className="workspace-top-grid">
            <article className="item-form-section" ref={itemFormSectionRef}>
              <div className="form-heading-row">
                <div>
                  <h2>Add Grocery Item</h2>
                </div>
                <div className="context-chips">
                  <span className={`context-chip ${getModeClass(activeMode)}`}>
                    {activeMode}
                  </span>
                  <span className="context-chip neutral">
                    {selectedDay} {selectedMonthName} {selectedYear}
                  </span>
                </div>
              </div>

              <form className="item-form" onSubmit={handleAddItem}>
                <input
                  type="text"
                  placeholder="Item Name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />

                <input
                  type="number"
                  step="0.01"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />

                <select
                  className={!unit ? "placeholder-select" : ""}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="" disabled>
                    Unit
                  </option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="L">L</option>
                  <option value="mL">mL</option>
                  <option value="packet">packet</option>
                  <option value="piece">piece</option>
                </select>

                <input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />

                <button type="submit" className="primary-btn">
                  Add Item
                </button>
              </form>
            </article>
          </div>

          <div className="workspace-lower-grid" ref={itemListSectionRef}>
            <article className="item-list-section card">
              <div className="section-header">
                <div>
                  <h2>Item List</h2>
                  <p className="section-summary">
                    Reviewing <strong>{activeListModeLabel}</strong> items for{" "}
                    <strong>{selectedDateLabel}</strong>.
                  </p>
                </div>

                <select
                  className="mode-dropdown"
                  value={listMode}
                  onChange={(e) => handleListModeChange(e.target.value)}
                >
                  <option value="Family">Family</option>
                  <option value="Party">Party</option>
                  <option value="Guest">Guest</option>
                  <option value="Festival">Festival</option>
                  <option value="All">All</option>
                </select>
              </div>

              {filteredItems.length === 0 ? (
                <div className="empty-state">
                  <h3>No items for this view yet</h3>
                  <p>
                    Calendar is currently focused on <strong>{selectedDateLabel}</strong>.
                    Add a grocery item above or switch the list mode filter.
                  </p>
                </div>
              ) : (
                <div
                  ref={itemListRef}
                  className={`item-list ${
                    filteredItems.length > MAX_VISIBLE_ITEMS ? "expanded" : ""
                  }`}
                  style={
                    itemListMaxHeight
                      ? { maxHeight: `${itemListMaxHeight}px` }
                      : undefined
                  }
                >
                  {filteredItems.map((item) => (
                    <div
                      className={`item-row ${editingId === item._id ? "is-editing" : ""}`}
                      key={item._id}
                    >
                      {editingId === item._id ? (
                        <>
                          <div className="item-edit-fields">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Item name"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              placeholder="Quantity"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              placeholder="Price"
                            />
                          </div>

                          <div className="item-actions">
                            <button
                              type="button"
                              className="action-btn update-btn"
                              onClick={() => handleSaveEdit(item._id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="action-btn cancel-btn"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="item-main">
                            <span className="item-name">{item.itemName}</span>
                            <span className="item-meta">
                              ({item.quantity} {item.unit}, {rupeeSymbol}
                              {Number(item.price).toFixed(2)})
                            </span>
                          </div>

                          <div className="item-actions">
                            <button
                              type="button"
                              className="action-btn update-btn"
                              onClick={() => handleEditClick(item)}
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteItem(item._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="item-list-shortcuts" aria-label="Analytics shortcuts">
                <button
                  type="button"
                  className="item-list-shortcut"
                  onClick={() => scrollToSection(modeChartSectionRef)}
                >
                  See Chart
                </button>
                <button
                  type="button"
                  className="item-list-shortcut"
                  onClick={() => scrollToSection(totalGraphSectionRef)}
                >
                  See Graph
                </button>
              </div>
            </article>

            <aside className="calendar-section card">
              <div className="section-header">
                <div>
                  <h2>Calendar</h2>
                  <p className="section-summary">
                    Pick a day to immediately change the list and visible spend.
                  </p>
                </div>
                <div className="calendar-dropdown-group">
                  <select
                    className="calendar-part-dropdown"
                    value={selectedDay}
                    onChange={(e) => handleCalendarPartChange("day", e.target.value)}
                  >
                    {dayOptions.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>

                  <select
                    className="calendar-part-dropdown"
                    value={selectedMonthIndex}
                    onChange={(e) =>
                      handleCalendarPartChange("month", e.target.value)
                    }
                  >
                    {monthNames.map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    className="calendar-part-dropdown"
                    value={selectedYear}
                    onChange={(e) =>
                      handleCalendarPartChange("year", e.target.value)
                    }
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="calendar-wrapper">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  showNeighboringMonth={false}
                  formatShortWeekday={(locale, date) =>
                    ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()]
                  }
                  tileClassName={({ date, view }) => {
                    if (view !== "month") return "";

                    const classes = [];
                    const isToday = isSameDate(date, new Date());
                    const isSelectedDate = isSameDate(date, selectedDate);

                    if (isToday) {
                      classes.push("today-tile");
                    }

                    if (isSelectedDate && !isToday) {
                      classes.push("selected-expense-tile");
                    }

                    return classes.join(" ");
                  }}
                  tileContent={({ date, view }) => {
                    if (view !== "month") return null;
                    if (!isSameDate(date, selectedDate)) return null;

                    const expense = getExpenseForDate(date);

                    return (
                      <div className="tile-expense">
                        {rupeeSymbol}
                        {expense.toFixed(0)}
                      </div>
                    );
                  }}
                />
              </div>
            </aside>
          </div>
        </section>

        <section className="analytics-grid">
          <div className="chart-stack">
            <article className="chart-card" ref={modeChartSectionRef}>
              <div className="chart-header">
                <div>
                  <h2>Mode-wise Expense</h2>
                </div>
                <select
                  className="chart-dropdown"
                  value={pieView}
                  onChange={(e) => setPieView(e.target.value)}
                >
                  <option>Daily</option>
                  <option>Monthly</option>
                </select>
              </div>

              <div className="chart-content">
                <div className="pie-chart-box" ref={pieBoxRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={pieChartMargin}>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="48%"
                        innerRadius={pieInnerRadius}
                        outerRadius={pieOuterRadius}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={2}
                        label={false}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          `${rupeeSymbol}${Number(value).toFixed(2)}`
                        }
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: "14px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {pieLabels.length > 0 && (
                    <svg
                      className="pie-label-overlay"
                      viewBox={`0 0 ${pieBoxSize.width} ${pieBoxSize.height}`}
                    >
                      {pieLabels.map((item) => (
                        <g key={item.key}>
                          <path
                            d={`M ${item.startX} ${item.startY} L ${item.lineX} ${item.lineY} L ${item.endX} ${item.endY}`}
                            className="pie-label-line"
                          />
                          <circle
                            cx={item.endX}
                            cy={item.endY}
                            r="2.5"
                            className="pie-label-dot"
                          />
                          <text
                            x={item.textX}
                            y={item.endY - (item.compact ? 4 : 5)}
                            textAnchor={item.anchor}
                            className="pie-label-name"
                          >
                            {item.name}
                          </text>
                          <text
                            x={item.textX}
                            y={item.endY + (item.compact ? 11 : 13)}
                            textAnchor={item.anchor}
                            className="pie-label-value"
                          >
                            {rupeeSymbol}
                            {Number(item.value).toFixed(0)}
                          </text>
                        </g>
                      ))}
                    </svg>
                  )}
                </div>
              </div>
            </article>

            <article className="chart-card" ref={totalGraphSectionRef}>
              <div className="chart-header">
                <div>
                  <h2>Total Expense</h2>
                </div>
                <select
                  className="chart-dropdown"
                  value={graphView}
                  onChange={(e) => setGraphView(e.target.value)}
                >
                  <option>Daily</option>
                  <option>Monthly</option>
                </select>
              </div>

              <div className="chart-content">
                <div
                  className={`line-chart-box ${
                    isLineChartScrollable ? "is-scrollable" : ""
                  }`}
                  ref={lineBoxRef}
                >
                  <div
                    className="line-chart-scroll"
                    style={
                      isLineChartScrollable
                        ? { width: `${lineChartContentWidth}px` }
                        : undefined
                    }
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={graphData}
                        margin={{
                          top: 18,
                          right: 18,
                          left: 6,
                          bottom: graphView === "Daily" ? 22 : 18,
                        }}
                      >
                        <CartesianGrid
                          vertical={false}
                          stroke="rgba(148, 163, 184, 0.24)"
                          strokeDasharray="4 6"
                        />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={{ stroke: "var(--chart-axis)", strokeWidth: 1.6 }}
                          tick={{
                            fill: "var(--chart-text)",
                            fontSize:
                              graphView === "Daily"
                                ? isLaptopLineChart
                                  ? 10
                                  : 12
                                : 13,
                            fontWeight: 600,
                          }}
                          tickMargin={graphView === "Daily" ? 10 : 8}
                          interval={0}
                          minTickGap={0}
                          angle={0}
                          textAnchor="middle"
                          height={32}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={{ stroke: "var(--chart-axis)", strokeWidth: 1.6 }}
                          tick={{
                            fill: "var(--chart-text)",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                          tickCount={5}
                          width={44}
                        />
                        <Tooltip
                          formatter={(value) =>
                            `${rupeeSymbol}${Number(value).toFixed(2)}`
                          }
                          contentStyle={{
                            backgroundColor: "var(--chart-tooltip-bg)",
                            border: "1px solid var(--chart-tooltip-border)",
                            borderRadius: "14px",
                            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                          }}
                          labelFormatter={(label, payload) => {
                            if (graphView !== "Daily") {
                              return label;
                            }

                            return payload?.[0]?.payload?.fullLabel || label;
                          }}
                          cursor={{
                            stroke: "rgba(37, 99, 235, 0.22)",
                            strokeWidth: 2,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="expense"
                          stroke="#2563eb"
                          strokeWidth={3.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          dot={{
                            r: graphView === "Daily" ? 4 : 4.5,
                            strokeWidth: 2.5,
                            fill: "#ffffff",
                            stroke: "#2563eb",
                          }}
                          activeDot={{
                            r: graphView === "Daily" ? 5.5 : 6,
                            strokeWidth: 2.5,
                            fill: "#ffffff",
                            stroke: "#1d4ed8",
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <div className="dashboard-footer">
          <button
            type="button"
            className="logout-btn dashboard-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
