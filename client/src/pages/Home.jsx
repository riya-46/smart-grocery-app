import { useEffect, useMemo, useState } from "react";
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

function Home() {
  const API_URL = "http://localhost:5000/api/groceries";
  const navigate = useNavigate();

  const [mode, setMode] = useState("Family");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState("");

  const [items, setItems] = useState([]);
  const [listMode, setListMode] = useState("Family");
  const [showAllItems, setShowAllItems] = useState(false);
  const [pieView, setPieView] = useState("Daily");
  const [graphView, setGraphView] = useState("Daily");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString("en-GB");
  };

  const isSameDate = (date1, date2) => {
    return formatDate(date1) === formatDate(date2);
  };

  const handleModeChange = (selectedMode) => {
    setMode(selectedMode);
    setListMode(selectedMode);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!itemName || !quantity || !unit || !price) {
      alert("Please fill all fields");
      return;
    }

    try {
      const newItem = {
        itemName: itemName.trim(),
        quantity: Number(quantity),
        unit,
        price: Number(price),
        mode,
        selectedDate: formatDate(selectedDate),
      };

      const response = await axios.post(API_URL, newItem);

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
      await axios.delete(`${API_URL}/${id}`);
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
      const updatedItem = {
        itemName: editName.trim(),
        quantity: Number(editQuantity),
        price: Number(editPrice),
      };

      const response = await axios.put(`${API_URL}/${id}`, updatedItem);

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

  const visibleItems = showAllItems ? filteredItems : filteredItems.slice(0, 5);

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

  const modes = ["Family", "Party", "Guest", "Festival"];
  const pieColors = ["#2563eb", "#f59e0b", "#10b981", "#ef4444"];

  const pieData = useMemo(() => {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    const selectedDay = formatDate(selectedDate);

    return modes.map((currentMode) => {
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

  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        const response = await axios.get(API_URL);
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching groceries:", error);
      }
    };

    fetchGroceries();
  }, []);

  return (
    <div className="home-page">
      <div className="dashboard-topbar">
        <div className="topbar-left">
          <div className="mode-mini-card">
            <span className="mini-label">Current Mode</span>
            <strong>{mode}</strong>
          </div>
        </div>

        <div className="topbar-center">
          <h1 className="dashboard-title">Smart Grocery Dashboard</h1>

          <div className="mode-section">
            <button
              className={`mode-btn ${mode === "Family" ? "active" : ""}`}
              onClick={() => handleModeChange("Family")}
            >
              Family
            </button>
            <button
              className={`mode-btn ${mode === "Party" ? "active" : ""}`}
              onClick={() => handleModeChange("Party")}
            >
              Party
            </button>
            <button
              className={`mode-btn ${mode === "Guest" ? "active" : ""}`}
              onClick={() => handleModeChange("Guest")}
            >
              Guest
            </button>
            <button
              className={`mode-btn ${mode === "Festival" ? "active" : ""}`}
              onClick={() => handleModeChange("Festival")}
            >
              Festival
            </button>
          </div>
        </div>

        <div className="topbar-right">
          <div className="user-panel">
            <span className="welcome-text">Welcome</span>
            <button
              type="button"
              className="logout-btn"
              onClick={() => navigate("/")}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-highlight-row">
        <div className="card">
          <h2>Total Today Expense</h2>
          <p>₹{todayExpense.toFixed(2)}</p>
        </div>

        <button
          type="button"
          className="ai-feature-card"
          onClick={() => navigate("/ai")}
        >
          <div className="ai-icon">🤖</div>
          <div className="ai-feature-content">
            <h2>Smart AI Healthy Food Suggestion</h2>
            <p>Open future AI-based food, recipe and nutrition recommendations</p>
          </div>
          <span className="ai-arrow">→</span>
        </button>

        <div className="card">
          <h2>Total Monthly Expense</h2>
          <p>₹{monthlyExpense.toFixed(2)}</p>
        </div>
      </div>

      <div className="item-form-section">
        <h2>Add Grocery Item</h2>
        <p className="selected-info">
          Adding item for: <strong>{formatDate(selectedDate)}</strong> | Mode:{" "}
          <strong>{mode}</strong>
        </p>

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
                setShowAllItems(false);
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
              <div className="item-list">
                {visibleItems.map((item) => (
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
                            ({item.quantity} {item.unit}, ₹
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

              {filteredItems.length > 5 && (
                <button
                  type="button"
                  className="toggle-items-btn"
                  onClick={() => setShowAllItems((prev) => !prev)}
                >
                  {showAllItems ? "Show Less" : "Show More"}
                </button>
              )}
            </>
          )}
        </div>

        <div className="calendar-section">
          <div className="section-header">
            <h2>Calendar</h2>
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

                return <div className="tile-expense">₹{expense.toFixed(0)}</div>;
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
            <div className="pie-chart-box">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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
            <div className="pie-chart-box">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
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