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
} from "recharts";

const MODES = ["Family", "Party", "Guest", "Festival"];
const PIE_COLORS = ["#2563eb", "#f59e0b", "#10b981", "#ef4444"];

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
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");

  const [items, setItems] = useState([]);
  const [listMode, setListMode] = useState("Family");
  const [pieView, setPieView] = useState("Daily");
  const [graphView, setGraphView] = useState("Daily");
  const [highlightStep, setHighlightStep] = useState(0);
  const pieBoxRef = useRef(null);
  const [pieBoxSize, setPieBoxSize] = useState({ width: 0, height: 0 });

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const [username] = useState(currentUser?.name || "User");

  const highlightSequence = [1, 2, 1, 0];
  const activeHighlight = highlightSequence[highlightStep];

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

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
    setListMode(selectedMode);
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
        mode,
        selectedDate: formatDate(selectedDate),
      };

      const response = await axios.post(API_URL, newItem, authConfig);

      setItems((prev) => [response.data, ...prev]);

      setItemName("");
      setQuantity("");
      setUnit("kg");
      setPrice("");
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

  const filteredItems = items.filter((item) => {
    const sameDate = item.selectedDate === formatDate(selectedDate);
    const sameMode = listMode === "All" ? true : item.mode === listMode;
    return sameDate && sameMode;
  });

  const todayExpense = useMemo(() => {
    const today = formatDate(new Date());

    return items
      .filter((item) => item.selectedDate === today)
      .reduce((sum, item) => sum + Number(item.price), 0);
  }, [items]);

  const monthlyExpense = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return items
      .filter((item) => {
        const [day, month, year] = item.selectedDate.split("/").map(Number);
        const itemDate = new Date(year, month - 1, day);

        return (
          itemDate.getMonth() === currentMonth &&
          itemDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, item) => sum + Number(item.price), 0);
  }, [items]);

  const getExpenseForDate = (date) => {
    const formattedDate = formatDate(date);

    return items
      .filter((item) => {
        if (item.selectedDate !== formattedDate) return false;
        if (listMode === "All") return true;
        return item.mode === listMode;
      })
      .reduce((sum, item) => sum + Number(item.price), 0);
  };

  const pieData = useMemo(() => {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    const selectedDay = formatDate(selectedDate);

    return MODES.map((currentMode) => {
      const total = items
        .filter((item) => {
          if (item.mode !== currentMode) return false;

          if (pieView === "Daily") {
            return item.selectedDate === selectedDay;
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
  }, [items, graphView, selectedDate]);

  const pieLabels = useMemo(() => {
    const width = pieBoxSize.width;
    const height = pieBoxSize.height;
    const outerRadius = 150;
    const total = pieData.reduce((sum, item) => sum + item.value, 0);

    if (!width || !height || !total) return [];

    const cx = width * 0.5;
    const cy = height * 0.47;
    let currentAngle = 0;

    return pieData
      .filter((item) => item.value > 0)
      .map((item) => {
        const sliceAngle = (item.value / total) * 360;
        const midAngle = currentAngle + sliceAngle / 2;
        currentAngle += sliceAngle;

        const radian = (midAngle * Math.PI) / 180;
        const cos = Math.cos(radian);
        const sin = Math.sin(radian);

        const startX = cx + cos * (outerRadius - 2);
        const startY = cy - sin * (outerRadius - 2);
        const lineX = cx + cos * (outerRadius + 18);
        const lineY = cy - sin * (outerRadius + 18);
        const endX = lineX + (cos >= 0 ? 28 : -28);
        const endY = lineY;
        const anchor = cos >= 0 ? "start" : "end";
        const textX = endX + (anchor === "start" ? 8 : -8);

        return {
          key: item.name,
          label: `${item.name}: ${rupeeSymbol}${Number(item.value).toFixed(0)}`,
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
  }, [pieData, pieBoxSize, rupeeSymbol]);

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
  }, [API_URL, authConfig, authToken, navigate]);

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
    const intervalId = window.setInterval(() => {
      setHighlightStep((current) => (current + 1) % highlightSequence.length);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [highlightSequence.length]);

  return (
    <div className="home-page">
      <section className="dashboard-hero">
        <div className="dashboard-topbar">
          <div className="title-shell">
            <h1 className="dashboard-title">Smart Grocery Management</h1>
          </div>
        </div>

        <div className="dashboard-controlbar">
          <div className="topbar-left">
            <div className="mode-mini-card">
              <span className="mini-label">Current Mode</span>
              <strong className={`current-mode-value ${getModeClass(mode)}`}>
                {mode}
              </strong>
            </div>
          </div>

          <div className="topbar-center">
            <div className="mode-section">
              <button
                className={`mode-btn mode-family ${
                  mode === "Family" ? "active" : ""
                }`}
                onClick={() => handleModeChange("Family")}
              >
                Family
              </button>
              <button
                className={`mode-btn mode-party ${
                  mode === "Party" ? "active" : ""
                }`}
                onClick={() => handleModeChange("Party")}
              >
                Party
              </button>
              <button
                className={`mode-btn mode-guest ${
                  mode === "Guest" ? "active" : ""
                }`}
                onClick={() => handleModeChange("Guest")}
              >
                Guest
              </button>
              <button
                className={`mode-btn mode-festival ${
                  mode === "Festival" ? "active" : ""
                }`}
                onClick={() => handleModeChange("Festival")}
              >
                Festival
              </button>
            </div>
          </div>

          <div className="topbar-right">
            <div className="user-panel">
              <span className="username-text">{username}</span>
              <button
                type="button"
                className="logout-btn logout-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-highlight-row">
        <div className={`highlight-shell highlight-shell-left ${activeHighlight === 0 ? "active" : ""}`}>
          <div className="card stats-card">
            <h2>Total Today Expense</h2>
            <p>{rupeeSymbol}{todayExpense.toFixed(2)}</p>
          </div>
        </div>

        <div className={`highlight-shell highlight-shell-center ${activeHighlight === 1 ? "active" : ""}`}>
          <button
            type="button"
            className="ai-feature-card"
            onClick={() => navigate("/ai")}
          >
            <div className="ai-icon">AI</div>
            <div className="ai-feature-content">
              <h2>Smart AI Healthy Food Suggestion</h2>
              <p>Open future AI-based food items, recipe and nutrition recommendations</p>
            </div>
            <span className="ai-arrow">{"->"}</span>
          </button>
        </div>

        <div className={`highlight-shell highlight-shell-right ${activeHighlight === 2 ? "active" : ""}`}>
          <div className="card stats-card">
            <h2>Total Monthly Expense</h2>
            <p>{rupeeSymbol}{monthlyExpense.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="item-form-section"> 
        <div className="form-heading-row">
          <h2>Add Grocery Item</h2>
          <p className="selected-info">
            Adding item for: <strong>{formatDate(selectedDate)}</strong> | Mode:{" "}
            <strong>{mode}</strong>
          </p>
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

          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
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

          <button type="submit">Add Item</button>
        </form>
      </div>

      <div className="bottom-section">
        <div className="item-list-section">
          <div className="section-header">
            <h2>Item List</h2>

            <select
              className="mode-dropdown"
              value={listMode}
              onChange={(e) => {
                setListMode(e.target.value);
              }}
            >
              <option value="Family">Family</option>
              <option value="Party">Party</option>
              <option value="Guest">Guest</option>
              <option value="Festival">Festival</option>
              <option value="All">All</option>
            </select>
          </div>

          {filteredItems.length === 0 ? (
            <p>No items found for selected mode</p>
          ) : (
            <>
              <div
                className={`item-list ${
                  filteredItems.length > 4 ? "expanded" : ""
                }`}
              >
                {filteredItems.map((item) => (
                  <div className="item-row" key={item._id}>
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

            </>
          )}
        </div>

        <div className="calendar-section">
          <div className="section-header">
            <h2>Calendar</h2>
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

                if (isSameDate(date, new Date())) {
                  classes.push("today-tile");
                }

                if (isSameDate(date, selectedDate)) {
                  classes.push("selected-expense-tile");
                }

                return classes.join(" ");
              }}
              tileContent={({ date, view }) => {
                if (view !== "month") return null;
                if (!isSameDate(date, selectedDate)) return null;

                const expense = getExpenseForDate(date);

                return <div className="tile-expense">{rupeeSymbol}{expense.toFixed(0)}</div>;
              }}
            />
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-card">
          <div className="chart-header">
            <h2>Mode-wise Expense</h2>
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
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="47%"
                    outerRadius={150}
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
                  <Legend wrapperStyle={{ paddingTop: "10px" }} />
                </PieChart>
              </ResponsiveContainer>

              {pieLabels.length > 0 && (
                <svg className="pie-label-overlay" viewBox={`0 0 ${pieBoxSize.width} ${pieBoxSize.height}`}>
                  {pieLabels.map((item) => (
                    <g key={item.key}>
                      <path
                        d={`M ${item.startX} ${item.startY} L ${item.lineX} ${item.lineY} L ${item.endX} ${item.endY}`}
                        fill="none"
                        stroke="#475569"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <circle cx={item.endX} cy={item.endY} r="2.5" fill="#475569" />
                      <text
                        x={item.textX}
                        y={item.endY}
                        textAnchor={item.anchor}
                        dominantBaseline="central"
                        fill="#0f172a"
                        fontSize="13"
                        fontWeight="700"
                      >
                        {item.label}
                      </text>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>Total Expense Trend</h2>
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
            <div className="line-chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={graphData}
                  margin={{ top: 18, right: 18, left: 6, bottom: 18 }}
                >
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: "#334155", strokeWidth: 1.6 }}
                    tick={{ fill: "#0f172a", fontSize: 13, fontWeight: 600 }}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: "#334155", strokeWidth: 1.6 }}
                    tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 600 }}
                    tickCount={5}
                    width={44}
                  />
                  <Tooltip
                    formatter={(value) =>
                      `${rupeeSymbol}${Number(value).toFixed(2)}`
                    }
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid rgba(148, 163, 184, 0.35)",
                      borderRadius: "14px",
                      boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                    }}
                    cursor={{ stroke: "rgba(37, 99, 235, 0.22)", strokeWidth: 2 }}
                  />
                  <Line
                    type="linear"
                    dataKey="expense"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4.5, fill: "#ffffff", stroke: "#2563eb", strokeWidth: 3 }}
                    activeDot={{ r: 7, fill: "#ffffff", stroke: "#2563eb", strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

