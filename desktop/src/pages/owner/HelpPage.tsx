import { useState } from 'react';
import {
  IconHelp,
  IconShoppingCart,
  IconLayoutDashboard,
  IconQuestionMark,
  IconKeyboard,
  IconBook,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconAlertCircle,
  IconInfoCircle,
} from '@tabler/icons-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'cashier' | 'owner' | 'faq' | 'shortcuts' | 'howto';

// ─── Shared components ────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-4 rounded-xl p-5"
      style={{ backgroundColor: '#111111', border: '1px solid #2C2C2C' }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, color: '#606060', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
      {children}
    </p>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 24, height: 24, borderRadius: '50%',
          backgroundColor: 'rgba(var(--accent-color-rgb, 192,57,43),0.15)',
          border: '1px solid rgba(var(--accent-color-rgb, 192,57,43),0.3)',
          fontSize: 11, fontWeight: 700, color: 'var(--accent-color, #C0392B)',
        }}
      >
        {number}
      </div>
      <div className="flex flex-col gap-0.5">
        <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>{title}</span>
        <span style={{ fontSize: 12, color: '#A0A0A0', lineHeight: 1.6 }}>{description}</span>
      </div>
    </div>
  );
}

function Tip({ type = 'info', children }: { type?: 'info' | 'warning' | 'success'; children: React.ReactNode }) {
  const styles = {
    info:    { bg: 'rgba(52,152,219,0.08)',  border: 'rgba(52,152,219,0.25)',  color: '#3498DB',  icon: <IconInfoCircle size={14} /> },
    warning: { bg: 'rgba(243,156,18,0.08)',  border: 'rgba(243,156,18,0.25)',  color: '#F39C12',  icon: <IconAlertCircle size={14} /> },
    success: { bg: 'rgba(39,174,96,0.08)',   border: 'rgba(39,174,96,0.25)',   color: '#27AE60',  icon: <IconCircleCheck size={14} /> },
  }[type];

  return (
    <div
      className="flex gap-2 rounded-lg p-3"
      style={{ backgroundColor: styles.bg, border: `1px solid ${styles.border}` }}
    >
      <span style={{ color: styles.color, flexShrink: 0, marginTop: 1 }}>{styles.icon}</span>
      <span style={{ fontSize: 12, color: '#A0A0A0', lineHeight: 1.6 }}>{children}</span>
    </div>
  );
}

// ─── FAQ accordion item ───────────────────────────────────────────────────────

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #2C2C2C' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-left py-3 gap-3"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ fontSize: 13, color: '#ffffff', fontWeight: 500 }}>{question}</span>
        {open
          ? <IconChevronDown size={15} color="#606060" style={{ flexShrink: 0 }} />
          : <IconChevronRight size={15} color="#606060" style={{ flexShrink: 0 }} />
        }
      </button>
      {open && (
        <p style={{ fontSize: 13, color: '#A0A0A0', lineHeight: 1.7, paddingBottom: 12 }}>
          {answer}
        </p>
      )}
    </div>
  );
}

// ─── Keyboard shortcut row ────────────────────────────────────────────────────

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #1A1A1A' }}>
      <span style={{ fontSize: 13, color: '#A0A0A0' }}>{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((k, i) => (
          <span key={i}>
            <kbd style={{
              backgroundColor: '#1A1A1A',
              border: '1px solid #2C2C2C',
              borderRadius: 5,
              padding: '2px 8px',
              fontSize: 11,
              fontFamily: 'monospace',
              color: '#ffffff',
              boxShadow: '0 1px 0 #000',
            }}>
              {k}
            </kbd>
            {i < keys.length - 1 && <span style={{ fontSize: 11, color: '#606060', margin: '0 2px' }}>+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── How-to guide item ────────────────────────────────────────────────────────

function HowToGuide({ title, steps, tip }: {
  title: string;
  steps: { title: string; description: string }[];
  tip?: { type?: 'info' | 'warning' | 'success'; text: string };
}) {
  return (
    <Card>
      <SectionTitle>{title}</SectionTitle>
      <div className="flex flex-col gap-3">
        {steps.map((s, i) => (
          <Step key={i} number={i + 1} title={s.title} description={s.description} />
        ))}
      </div>
      {tip && <Tip type={tip.type}>{tip.text}</Tip>}
    </Card>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function CashierGuide() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionTitle>Taking an Order</SectionTitle>
        <div className="flex flex-col gap-3">
          <Step number={1} title="Browse the menu" description="Use the category tabs at the top to filter items by category. Featured items appear first with a star indicator." />
          <Step number={2} title="Add items to the order" description="Click any menu item card to add it to the order panel on the right. Click multiple times to increase quantity." />
          <Step number={3} title="Adjust quantities" description="In the order panel, use the + and − buttons to change quantity, or click the trash icon to remove an item entirely." />
          <Step number={4} title="Add item notes" description="Click the note icon on any order item to add special instructions (e.g. 'no onions', 'extra sauce')." />
          <Step number={5} title="Select payment method" description="Choose the payment method from the dropdown at the bottom of the order panel." />
          <Step number={6} title="Enter cash tendered (if cash)" description="For cash payments, enter the amount given by the customer. The change will be calculated automatically." />
          <Step number={7} title="Place the order" description="Click the Place Order button. The order is sent to the queue and a receipt summary is shown." />
        </div>
        <Tip type="info">If an item shows a promo price, that price is used automatically when added to the order.</Tip>
      </Card>

      <Card>
        <SectionTitle>Holding & Resuming Orders</SectionTitle>
        <div className="flex flex-col gap-3">
          <Step number={1} title="Hold the current order" description="Click the Hold button in the order panel to save the current order temporarily without placing it." />
          <Step number={2} title="Label the held order" description="Enter a label (e.g. 'Table 3' or 'Customer A') so you can identify it later." />
          <Step number={3} title="Resume a held order" description="Click the held orders icon in the order panel header to see all held orders, then click one to resume it." />
        </div>
        <Tip type="warning">Held orders are stored locally. They will be lost if the app is closed before placing them.</Tip>
      </Card>

      <Card>
        <SectionTitle>Viewing the Queue</SectionTitle>
        <div className="flex flex-col gap-3">
          <Step number={1} title="Open the queue" description="Click the Queue button in the top-right of the cashier screen. The badge shows the number of pending orders." />
          <Step number={2} title="Monitor order age" description="Each order card shows how long ago it was placed. Orders older than 5 minutes turn orange; older than 10 minutes turn red." />
          <Step number={3} title="Mark as done" description="Click Mark as Done on an order card to complete it and remove it from the queue." />
        </div>
      </Card>

      <Card>
        <SectionTitle>Logging Out</SectionTitle>
        <div className="flex flex-col gap-3">
          <Step number={1} title="Click the logout icon" description="The logout button is in the top-right corner of the cashier screen." />
          <Step number={2} title="Confirm logout" description="A confirmation dialog will appear. Click Logout to confirm." />
        </div>
        <Tip type="warning">Make sure all pending orders are placed or held before logging out.</Tip>
      </Card>
    </div>
  );
}

function OwnerGuide() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionTitle>Dashboard</SectionTitle>
        <div className="flex flex-col gap-3">
          <Step number={1} title="Period filter" description="Use the filter pills (Today, This Week, This Month, Last Month, All, Custom) to scope all dashboard data to a specific time range." />
          <Step number={2} title="All + Year filter" description="When 'All' is selected, a year dropdown appears in the header. Use it to view data for a specific year." />
          <Step number={3} title="Stat cards" description="The top row shows Total Sales, Total Orders, and a breakdown by payment method. Click a payment method card to filter the view." />
          <Step number={4} title="Daily target" description="Set a daily sales target from the dashboard. A progress bar shows how close you are to the goal." />
          <Step number={5} title="Cash drawer" description="Open and close the cash drawer from the dashboard. Set the opening amount at the start of the day." />
          <Step number={6} title="End of Day" description="Click the End of Day button to generate a summary report for the current day." />
        </div>
      </Card>

      <Card>
        <SectionTitle>Menu Management</SectionTitle>
        <div className="flex flex-col gap-3">
          <Step number={1} title="Add a menu item" description="Click Add Item, fill in the name, description, price, category, and optionally upload an image." />
          <Step number={2} title="Edit an item" description="Click the pencil icon on any row to edit that item's details." />
          <Step number={3} title="Toggle availability" description="Click the availability badge on any item to instantly mark it as available or unavailable." />
          <Step number={4} title="Set a promo price" description="Click the tag icon to set a discounted promo price and an optional promo label (e.g. 'Sale', '20% Off')." />
          <Step number={5} title="Feature an item" description="Click the star icon to mark an item as featured. Featured items appear first in the cashier menu grid." />
          <Step number={6} title="Manage categories" description="Use the Categories tab to add, rename, or delete categories. Items without a category appear under 'Uncategorized'." />
        </div>
        <Tip type="warning">Deleting a category does not delete its items — they become uncategorized.</Tip>
      </Card>

      <Card>
        <SectionTitle>Analytics</SectionTitle>
        <div className="flex flex-col gap-3">
          <Step number={1} title="Period filter" description="Filter all analytics data by Today, This Week, This Month, Last Month, All (with year picker), or a Custom date range." />
          <Step number={2} title="Sales chart" description="The area chart shows daily sales for the last 7 days." />
          <Step number={3} title="Category donut" description="The donut chart shows revenue distribution across menu categories." />
          <Step number={4} title="Peak hours" description="The bar chart shows which hours of the day generate the most orders and revenue." />
          <Step number={5} title="Best sellers" description="The ranked list shows your top-selling items by quantity and revenue for the selected period." />
          <Step number={6} title="Monthly radar" description="The radar chart shows sales distribution across all 12 months of the selected year." />
        </div>
      </Card>

      <Card>
        <SectionTitle>Expenses</SectionTitle>
        <div className="flex flex-col gap-3">
          <Step number={1} title="Add an expense" description="Click Add Expense, enter a description, amount, category, and date." />
          <Step number={2} title="Filter expenses" description="Use the period filter to view expenses for a specific time range." />
          <Step number={3} title="Category breakdown" description="The summary card shows a bar chart of spending by category." />
          <Step number={4} title="Edit or delete" description="Use the pencil and trash icons on each row to edit or remove an expense entry." />
        </div>
      </Card>

      <Card>
        <SectionTitle>Shift Reports</SectionTitle>
        <div className="flex flex-col gap-3">
          <Step number={1} title="Select a period" description="Choose a time range to see which staff members processed orders during that period." />
          <Step number={2} title="Staff cards" description="Each card shows a staff member's total orders, total sales, average order value, and shift time range." />
          <Step number={3} title="Sales share bar" description="The progress bar on each card shows that staff member's percentage of total sales for the period." />
        </div>
      </Card>

      <Card>
        <SectionTitle>Settings</SectionTitle>
        <div className="flex flex-col gap-3">
          <Step number={1} title="System Settings" description="Change the stall name and upload a logo. These appear in the cashier topbar and receipts." />
          <Step number={2} title="Appearance" description="Choose an accent color from the presets. The color applies across the entire app instantly." />
          <Step number={3} title="Payment Methods" description="Add, remove, reorder, and set default payment methods. Upload logos and assign colors to each method." />
          <Step number={4} title="Staff Management" description="Create cashier and kitchen accounts, reset passwords, and activate or deactivate staff accounts." />
          <Step number={5} title="Data Management" description="Create manual backups, configure automatic daily backups, and restore from a previous backup file." />
        </div>
        <Tip type="warning">Restoring a backup will overwrite all current data. Always create a backup before restoring.</Tip>
      </Card>
    </div>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: 'What happens if the internet goes down?',
      answer: 'The app runs entirely on your local network. As long as the server machine is running and the devices are on the same network, everything works normally without internet access.',
    },
    {
      question: 'Can multiple cashiers use the app at the same time?',
      answer: 'Yes. Multiple cashier devices can connect to the same server simultaneously. Orders placed by any cashier appear in the queue in real time on all connected devices.',
    },
    {
      question: 'How do I connect a cashier device to the server?',
      answer: 'On the cashier device, open the app and enter the server IP address and port (shown in the Connect page). Make sure both devices are on the same Wi-Fi network.',
    },
    {
      question: 'What is the difference between cashier and kitchen roles?',
      answer: 'Cashier accounts can place orders and view the queue. Kitchen accounts can only view the queue and mark orders as done. Neither role has access to the owner dashboard.',
    },
    {
      question: 'How do I reset a staff member\'s password?',
      answer: 'Go to Settings → Staff Management, click the edit icon on the staff member, and enter a new password. You do not need to know the old password.',
    },
    {
      question: 'Can I cancel a completed order?',
      answer: 'Yes. In Order History, click View on any completed order and use the Cancel Order option. You will be required to provide a reason of at least 5 characters.',
    },
    {
      question: 'Why is my daily target not showing progress?',
      answer: 'The daily target only tracks today\'s completed orders. Make sure the Dashboard is set to the Today filter and that a target amount has been set.',
    },
    {
      question: 'How do I change the accent color?',
      answer: 'Go to Settings → Display & Appearance and click one of the color preset buttons. The color updates instantly across the entire app.',
    },
    {
      question: 'What does "Hold Order" do?',
      answer: 'Holding an order saves the current cart temporarily so you can start a new order. You can resume held orders at any time from the held orders panel in the cashier screen.',
    },
    {
      question: 'How do I export order history?',
      answer: 'In the Order History page, click the Export Report button. A CSV file will be saved to your chosen location containing all orders for the selected period.',
    },
    {
      question: 'What is the End of Day report?',
      answer: 'The End of Day report is a summary of the current day\'s activity — total orders, revenue, payment breakdown, and top-selling items. Access it from the Dashboard via the End of Day button.',
    },
    {
      question: 'How do backups work?',
      answer: 'You can create a manual backup at any time from Settings → Data Management. You can also configure automatic daily backups at a set time. Backups are saved as .db files that can be restored later.',
    },
  ];

  return (
    <Card>
      <SectionTitle>Frequently Asked Questions</SectionTitle>
      <div className="flex flex-col">
        {faqs.map((f, i) => (
          <FAQItem key={i} question={f.question} answer={f.answer} />
        ))}
      </div>
    </Card>
  );
}

function ShortcutsSection() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <SectionTitle>Cashier Screen</SectionTitle>
        <div className="flex flex-col">
          <ShortcutRow keys={['Esc']}        description="Clear / cancel current input" />
          <ShortcutRow keys={['Enter']}      description="Confirm / place order (when order panel is focused)" />
          <ShortcutRow keys={['Ctrl', 'Z']}  description="Remove last added item from order" />
        </div>
      </Card>

      <Card>
        <SectionTitle>General Navigation</SectionTitle>
        <div className="flex flex-col">
          <ShortcutRow keys={['Alt', '1']}   description="Go to Dashboard" />
          <ShortcutRow keys={['Alt', '2']}   description="Go to Menu" />
          <ShortcutRow keys={['Alt', '3']}   description="Go to Order History" />
          <ShortcutRow keys={['Alt', '4']}   description="Go to Analytics" />
          <ShortcutRow keys={['Alt', '5']}   description="Go to Expenses" />
          <ShortcutRow keys={['Alt', '6']}   description="Go to Shift Reports" />
          <ShortcutRow keys={['Alt', ',']}   description="Go to Settings" />
        </div>
      </Card>

      <Card>
        <SectionTitle>Modals & Dialogs</SectionTitle>
        <div className="flex flex-col">
          <ShortcutRow keys={['Esc']}        description="Close any open modal or dialog" />
          <ShortcutRow keys={['Enter']}      description="Confirm action in dialogs" />
        </div>
        <Tip type="info">Keyboard shortcuts work best when no text input is focused.</Tip>
      </Card>
    </div>
  );
}

function HowToSection() {
  return (
    <div className="flex flex-col gap-4">
      <HowToGuide
        title="How to Set Up the App for the First Time"
        steps={[
          { title: 'Start the server', description: 'Run the server on the main machine. Note the IP address and port shown in the terminal (default: port 3000).' },
          { title: 'Open the desktop app', description: 'Launch the desktop app on the owner machine. It will connect to the server automatically if on the same machine.' },
          { title: 'Log in as owner', description: 'Use the default owner credentials to log in. Change your password immediately from Settings → Account Security.' },
          { title: 'Set your stall name and logo', description: 'Go to Settings → System Settings. Enter your stall name and upload a logo image.' },
          { title: 'Add categories', description: 'Go to Menu → Categories tab. Add the categories your menu uses (e.g. Meals, Drinks, Snacks).' },
          { title: 'Add menu items', description: 'Go to Menu → Items tab. Click Add Item and fill in the details for each item.' },
          { title: 'Create staff accounts', description: 'Go to Settings → Staff Management. Create cashier and/or kitchen accounts for your staff.' },
          { title: 'Connect cashier devices', description: 'On each cashier device, open the app, go to the Connect page, and enter the server IP and port.' },
        ]}
        tip={{ type: 'success', text: 'Once set up, the app remembers the server connection. Staff only need to log in on subsequent uses.' }}
      />

      <HowToGuide
        title="How to Add a Promo Price to a Menu Item"
        steps={[
          { title: 'Go to Menu', description: 'Navigate to the Menu page from the sidebar.' },
          { title: 'Find the item', description: 'Locate the item you want to put on promo in the menu list.' },
          { title: 'Click the tag icon', description: 'Click the orange tag icon in the Actions column for that item.' },
          { title: 'Enter the promo price', description: 'Enter the discounted price and an optional promo label (e.g. "20% Off", "Sale").' },
          { title: 'Save', description: 'Click Save. The item will now show the promo price in the cashier menu grid with the original price crossed out.' },
        ]}
        tip={{ type: 'info', text: 'To remove a promo, click the tag icon again and clear the promo price field.' }}
      />

      <HowToGuide
        title="How to Export Order History as CSV"
        steps={[
          { title: 'Go to Order History', description: 'Navigate to the History page from the sidebar.' },
          { title: 'Select a period', description: 'Choose the time range you want to export using the filter pills.' },
          { title: 'Click Export Report', description: 'Click the Export Report button in the top-right corner.' },
          { title: 'Choose a save location', description: 'A file dialog will open. Choose where to save the CSV file.' },
          { title: 'Open in spreadsheet', description: 'Open the exported file in Excel, Google Sheets, or any spreadsheet app.' },
        ]}
        tip={{ type: 'info', text: 'The CSV includes order number, date, payment method, items, and total for every order in the selected period.' }}
      />

      <HowToGuide
        title="How to Back Up and Restore the Database"
        steps={[
          { title: 'Go to Settings → Data Management', description: 'Navigate to Settings and click Data Management in the left sidebar.' },
          { title: 'Create a manual backup', description: 'Click Create Backup Now. A file dialog will open — choose where to save the .db file.' },
          { title: 'To restore, click Restore', description: 'Click the Restore from Backup button and select a previously saved .db file.' },
          { title: 'Confirm the restore', description: 'A warning dialog will appear. Confirm to proceed — this will overwrite all current data.' },
          { title: 'Restart the server', description: 'After a successful restore, restart the server for the changes to take effect.' },
        ]}
        tip={{ type: 'warning', text: 'Always create a fresh backup before restoring. A restore cannot be undone.' }}
      />

      <HowToGuide
        title="How to Set Up Automatic Daily Backups"
        steps={[
          { title: 'Go to Settings → Data Management', description: 'Navigate to Settings and click Data Management.' },
          { title: 'Enable auto backup', description: 'Toggle the Auto Backup switch to on.' },
          { title: 'Set the backup time', description: 'Choose the time of day for the automatic backup (e.g. 11:00 PM after closing).' },
          { title: 'Save the configuration', description: 'Click Save Auto Backup Settings. The server will now create a backup automatically at the set time each day.' },
        ]}
        tip={{ type: 'success', text: 'Automatic backups are stored on the server machine. You can download or delete them from the backup list below the settings.' }}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'cashier',   label: 'Cashier Guide',    icon: <IconShoppingCart size={15} />    },
  { id: 'owner',     label: 'Owner Guide',      icon: <IconLayoutDashboard size={15} /> },
  { id: 'faq',       label: 'FAQ',              icon: <IconQuestionMark size={15} />    },
  { id: 'shortcuts', label: 'Shortcuts',        icon: <IconKeyboard size={15} />        },
  { id: 'howto',     label: 'How-to Guides',    icon: <IconBook size={15} />            },
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<TabId>('cashier');

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* Header */}
      <div className="flex items-center gap-2">
        <IconHelp size={18} color="var(--accent-color, #C0392B)" />
        <h1 className="text-white font-semibold text-lg">Help & User Guide</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--accent-color, #C0392B)' : '#111111',
              border: `1px solid ${activeTab === tab.id ? 'transparent' : '#2C2C2C'}`,
              color: activeTab === tab.id ? '#ffffff' : '#606060',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}
            onMouseEnter={e => { if (activeTab !== tab.id) { e.currentTarget.style.backgroundColor = '#1A1A1A'; e.currentTarget.style.color = '#ffffff'; } }}
            onMouseLeave={e => { if (activeTab !== tab.id) { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.color = '#606060'; } }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'cashier'   && <CashierGuide />}
      {activeTab === 'owner'     && <OwnerGuide />}
      {activeTab === 'faq'       && <FAQSection />}
      {activeTab === 'shortcuts' && <ShortcutsSection />}
      {activeTab === 'howto'     && <HowToSection />}

    </div>
  );
}
