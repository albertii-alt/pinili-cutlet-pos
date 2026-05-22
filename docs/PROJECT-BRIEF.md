# Project Brief
## Pinili Cutlet — LAN-Based POS System

### Overview
A multi-device Point of Sale (POS) system for Pinili Cutlet, a small
Japanese-Filipino food stall. The system runs entirely on a local
network (LAN) with no internet required. A laptop acts as the central
server and admin dashboard, while phones and tablets connect via
Wi-Fi to take orders and display the kitchen queue.

### Client
- **Business:** Pinili Cutlet Food Stall
- **Location:** Trinidad, Bohol, Philippines
- **Type:** Small food stall — Japanese-Filipino cuisine

### Users
| User | Device | Description |
|---|---|---|
| Owner | Laptop | Manages menu, views sales, analytics, order history |
| Cashier | Laptop / Tablet | Takes customer orders, handles payments |
| Kitchen Staff | Phone / Tablet | Views active order queue |

### Goals
- Replace manual paper-based ordering with a digital system
- Enable multi-device operation on a local network
- Give owner real-time visibility into sales and performance
- Build offline-first with online-ready architecture for future scaling
- Support GCash and Cash payment methods

### Network Setup
- A portable router creates a local Wi-Fi network
- Laptop runs the backend server and acts as the central hub
- Laptop is assigned a static local IP (e.g. 192.168.1.100)
- All other devices connect to the same Wi-Fi network
- Client devices access the system via the laptop's local IP + port

### Constraints
- No internet required — LAN only for v1
- Single stall, single location
- No receipt printing in v1
- No ingredient-level inventory tracking
- English language only
- Windows 10/11 laptop as the server

### Success Criteria
- Cashier can place an order in under 30 seconds
- Kitchen display updates in real-time when a new order is placed
- Owner can view today's sales summary instantly on login
- All data persists across server restarts
- System works with zero internet connection