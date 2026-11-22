const MENU = [
  { name: "Dashboard", icon: "▦" },
  { name: "Add Event", icon: "＋" },
  { name: "My Events", icon: "▣" },
  { name: "Registrations", icon: "▤" },
  { name: "Notifications", icon: "♧" },
  { name: "Profile", icon: "♙" },
];

function AdminSidebar({ activeTab, onSelect, open, onLogout }) {
  // "Event History" is opened from My Events, so keep that menu item highlighted.
  const highlighted = activeTab === "Event History" ? "My Events" : activeTab;

  return (
    <aside className={`admin-sidebar ${open ? "open" : ""}`} aria-label="Admin navigation">
      <div className="admin-brand">
        <img src="/campus-connect.svg" alt="" className="admin-brand-icon" />
        <span>
          Campus<span>Connect</span>
        </span>
      </div>

      <div className="admin-account">
        <div className="admin-avatar">A</div>
        <div>
          <h3>Administrator</h3>
          <p>Admin Account</p>
        </div>
      </div>

      <p className="sidebar-label">MAIN MENU</p>

      <nav className="admin-menu">
        {MENU.map((item) => (
          <button
            key={item.name}
            type="button"
            className={highlighted === item.name ? "admin-menu-item active" : "admin-menu-item"}
            aria-current={highlighted === item.name ? "page" : undefined}
            onClick={() => onSelect(item.name)}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-message">
          <h3>Plan. Organize.</h3>
          <p>Bring campus opportunities to life.</p>
          <span aria-hidden="true">♡</span>
        </div>

        <button type="button" className="admin-logout" onClick={onLogout}>
          ⇥ &nbsp; Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
