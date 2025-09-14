// Admin dashboard functionality
let appointments = JSON.parse(localStorage.getItem('appointments')) || [
    { id: '1001', patient: 'Chou Tzuyu', doctor: 'Dr. Myoui', department: 'Cardiology', time: '10:00 AM', date: '2023-06-14', status: 'confirmed' },
    { id: '1002', patient: 'Son Chaeyoung', doctor: 'Dr. Myoui', department: 'Cardiology', time: '11:30 AM', date: '2023-06-14', status: 'confirmed' },
    { id: '1003', patient: 'Minatozaki Sana', doctor: 'Dr. Myoui', department: 'Cardiology', time: '2:15 PM', date: '2023-06-14', status: 'confirmed' },
    { id: '1004', patient: 'Im Nayeon', doctor: 'Dr. Thananusak', department: 'Dermatology', time: '9:00 AM', date: '2023-06-14', status: 'pending' },
    { id: '1005', patient: 'Park Jihyo', doctor: 'Dr. Trakulwipatkul', department: 'Neurology', time: '1:00 PM', date: '2023-06-14', status: 'cancelled' }
];

// Initialize the admin dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Initialize notification system
    if (typeof NotificationSystem !== 'undefined') {
        window.notificationSystem = new NotificationSystem();
    }
    
    initAdminDashboard();
    
    // Save initial appointments to localStorage if not already set
    if (!localStorage.getItem('appointments')) {
        localStorage.setItem('appointments', JSON.stringify(appointments));
    }
});

function initAdminDashboard() {
    setupNavigation();
    loadDailyAppointments();
    setupEventListeners();
    
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointment-date').value = today;
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            
            // Hide all pages
            pages.forEach(page => {
                page.classList.remove('active');
            });
            
            // Show the selected page
            document.getElementById(pageId).classList.add('active');
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function setupEventListeners() {
    // Set up date change listener
    document.getElementById('appointment-date').addEventListener('change', loadDailyAppointments);
    document.getElementById('refresh-appointments').addEventListener('click', loadDailyAppointments);
    
    // Export button
    document.getElementById('export-appointments').addEventListener('click', exportAppointments);
    
    // View options
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const viewType = e.target.getAttribute('data-view');
            switchView(viewType);
        });
    });
    
    // Logout button - FIXED to redirect to index.html
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Add doctor button
    document.getElementById('add-doctor-btn').addEventListener('click', addNewDoctor);
    
    // Dark mode toggle - FIXED implementation
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        // Set initial state based on saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        darkModeToggle.checked = savedTheme === 'dark';
        
        // Add event listener
        darkModeToggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }
    
    // Notification bell event listener
    const notificationBell = document.getElementById('notification-bell');
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            const panel = document.getElementById('notification-panel');
            if (panel) {
                panel.classList.toggle('active');
                
                // Mark all as read when opening
                if (panel.classList.contains('active') && window.notificationSystem) {
                    window.notificationSystem.markAllAsRead();
                }
            }
        });
    }
    
    // Clear notifications button
    const clearBtn = document.getElementById('clear-notifications');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (window.notificationSystem) {
                window.notificationSystem.clearAllNotifications();
            }
        });
    }
    
    // Appointment action buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-appointment-btn')) {
            const appointmentId = e.target.getAttribute('data-id');
            viewAppointmentDetails(appointmentId);
        }
        
        if (e.target.classList.contains('edit-appointment-btn')) {
            const appointmentId = e.target.getAttribute('data-id');
            editAppointment(appointmentId);
        }
    });
}

function loadDailyAppointments() {
    const selectedDate = document.getElementById('appointment-date').value;
    const filteredAppointments = appointments.filter(appt => appt.date === selectedDate);
    
    updateAppointmentStats(filteredAppointments);
    renderAppointmentsTable(filteredAppointments);
}

function updateAppointmentStats(appointments) {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    
    document.getElementById('total-appointments').textContent = total;
    document.getElementById('confirmed-appointments').textContent = confirmed;
    document.getElementById('pending-appointments').textContent = pending;
    document.getElementById('cancelled-appointments').textContent = cancelled;
    
    // Update change indicators (simplified for demo)
    document.querySelectorAll('.stat-change').forEach(el => {
        if (el.classList.contains('up')) {
            el.textContent = `+${Math.floor(Math.random() * 5)} from yesterday`;
        } else if (el.classList.contains('down')) {
            el.textContent = `-${Math.floor(Math.random() * 3)} from yesterday`;
        } else {
            el.textContent = 'No change';
        }
    });
}

function renderAppointmentsTable(appointments) {
    const tbody = document.getElementById('appointments-body');
    tbody.innerHTML = '';
    
    if (appointments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No appointments found for selected date</td></tr>';
        return;
    }
    
    appointments.forEach(appt => {
        const row = document.createElement('tr');
        
        // Determine status class
        let statusClass = '';
        if (appt.status === 'confirmed') statusClass = 'status-confirmed';
        else if (appt.status === 'pending') statusClass = 'status-pending';
        else if (appt.status === 'cancelled') statusClass = 'status-cancelled';
        
        row.innerHTML = `
            <td>${appt.time}</td>
            <td>${appt.patient}</td>
            <td>${appt.doctor}</td>
            <td>${appt.department}</td>
            <td><span class="status-badge ${statusClass}">${appt.status}</span></td>
            <td>
                <button class="btn btn-outline view-appointment-btn" data-id="${appt.id}">View</button>
                <button class="btn btn-outline edit-appointment-btn" data-id="${appt.id}">Edit</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function viewAppointmentDetails(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
        alert(`Appointment Details:\n\nPatient: ${appointment.patient}\nDoctor: ${appointment.doctor}\nDepartment: ${appointment.department}\nTime: ${appointment.time}\nDate: ${appointment.date}\nStatus: ${appointment.status}`);
    }
}

function editAppointment(appointmentId) {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
        // In a real application, this would open a modal form
        const newStatus = prompt(`Edit appointment status for ${appointment.patient}:\n\nCurrent status: ${appointment.status}\n\nEnter new status (confirmed/pending/cancelled):`, appointment.status);
        
        if (newStatus && ['confirmed', 'pending', 'cancelled'].includes(newStatus.toLowerCase())) {
            appointment.status = newStatus.toLowerCase();
            
            // Update localStorage
            localStorage.setItem('appointments', JSON.stringify(appointments));
            
            loadDailyAppointments();
            alert('Appointment status updated successfully!');
        }
    }
}

function exportAppointments() {
    const selectedDate = document.getElementById('appointment-date').value;
    const filteredAppointments = appointments.filter(appt => appt.date === selectedDate);
    
    // In a real application, this would generate a CSV or PDF file
    alert(`Exporting ${filteredAppointments.length} appointments for ${selectedDate}...`);
    
    // Simulate export process
    setTimeout(() => {
        alert('Appointments exported successfully!');
    }, 1000);
}

function switchView(viewType) {
    // Toggle active state for view buttons
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    // In a real application, this would switch between list and calendar views
    alert(`Switching to ${viewType} view...`);
}

// FIXED: Logout function now redirects to index.html
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any admin session data if needed
        localStorage.removeItem('adminLoggedIn');
        
        // Redirect to index.html
        window.location.href = 'index.html';
    }
}

function addNewDoctor() {
    // In a real application, this would open a form modal
    alert('Add New Doctor functionality would open here.');
}

// Theme functionality - FIXED implementation
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update toggle button state
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.checked = theme === 'dark';
    }
}
