// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const mobileMenuBtn = document.querySelector('.nav-icon');
const mobileMenu = document.getElementById('mobile-menu');
const logoutBtns = document.querySelectorAll('#logout-btn, #logout-btn-mobile');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeToggleMobile = document.getElementById('dark-mode-toggle-mobile');

// Modal Elements
const modals = document.querySelectorAll('.modal');
const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');

// Data Storage
let appointments = [
    { id: '1001', patient: 'Chou Tzuyu', time: '10:00 AM', date: '2023-06-14', reason: 'Follow-up consultation', status: 'confirmed' },
    { id: '1002', patient: 'Son Chaeyoung', time: '11:30 AM', date: '2023-06-13', reason: 'New patient - Heart palpitations', status: 'confirmed' },
    { id: '1003', patient: 'Minatozaki Sana', time: '2:15 PM', date: '2023-06-15', reason: 'ECG results review', status: 'confirmed' },
    { id: '1004', patient: 'Minatozaki Sana', time: '9:00 AM', date: '2023-06-15', reason: 'Consultation', status: 'confirmed' },
    { id: '1005', patient: 'Park Jihyo', time: '11:00 AM', date: '2023-06-15', reason: 'Checkup', status: 'confirmed' },
    { id: '1006', patient: 'Im Nayeon', time: '1:00 PM', date: '2023-06-13', reason: 'Chest pain evaluation', status: 'confirmed' },
    { id: '1007', patient: 'Kim Dahyun', time: '2:00 PM', date: '2023-06-14', reason: 'Medication follow-up', status: 'confirmed' }
];

let appointmentRequests = [
    { id: '2001', patient: 'Im Nayeon', date: 'Tomorrow, 10:00 AM', reason: 'Chest pain and shortness of breath', type: 'New Patient', status: 'urgent' },
    { id: '2002', patient: 'Park Jihyo', date: 'June 20, 2:30 PM', reason: 'Routine cardiac checkup', type: 'Existing Patient', status: 'new' },
    { id: '2003', patient: 'Kim Dahyun', date: 'June 18, 4:00 PM', reason: 'Follow-up on medication', type: 'Existing Patient', status: 'new' }
];

let patients = [
    { id: '3001', name: 'Chou Tzuyu', patientId: 'P12345', age: 28, lastVisit: 'June 10, 2023', conditions: 'Hypertension, Coronary Artery Disease', medications: 'Lisinopril 10mg, Atorvastatin 20mg, Aspirin 81mg', nextAppointment: 'June 14, 2023 at 8:00 AM' },
    { id: '3002', name: 'Son Chaeyoung', patientId: 'P12346', age: 25, lastVisit: 'June 5, 2023', conditions: 'Heart Palpitations, Mitral Valve Prolapse', medications: 'Metoprolol 25mg, Magnesium Supplement', nextAppointment: 'June 13, 2023 at 11:30 AM' },
    { id: '3003', name: 'Minatozaki Sana', patientId: 'P12347', age: 30, lastVisit: 'June 8, 2023', conditions: 'Arrhythmia, High Cholesterol', medications: 'Amiodarone 200mg, Rosuvastatin 10mg', nextAppointment: 'June 15, 2023 at 2:15 PM' }
];

// Initialize the application
function init() {
    // Set up event listeners
    setupNavigation();
    setupModals();
    setupDashboardInteractions();
    setupAppointmentRequests();
    setupScheduleInteractions();
    setupPatientRecords();
    setupDarkMode();
    
    // Initialize notification system
    if (typeof NotificationSystem !== 'undefined') {
        window.notificationSystem = new NotificationSystem();
    }
    
    // Set up notification event listeners
    setupNotificationListeners();
    
    // Load any saved data from localStorage
    loadSavedData();
    
    // Update dashboard stats
    updateDashboardStats();
    renderAppointmentRequests();
}

// Setup notification listeners
function setupNotificationListeners() {
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
}

// Navigation functions
function setupNavigation() {
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            showPage(pageId);
            
            // Update active states
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu if open
            if (mobileMenu.getAttribute('hidden') === null) {
                toggleMobileMenu();
            }
        });
    });
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Logout buttons - FIXED to redirect to index.html
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', handleLogout);
    });
}

function showPage(pageId) {
    // Hide all pages
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update page title
    document.title = `${document.getElementById(pageId).querySelector('h1').textContent} - Doctor Portal`;
}

function toggleMobileMenu() {
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    
    if (mobileMenu.getAttribute('hidden') !== null) {
        mobileMenu.removeAttribute('hidden');
    } else {
        mobileMenu.setAttribute('hidden', 'true');
    }
}

// FIXED: Logout function now redirects to index.html
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear any user data
        localStorage.removeItem('doctorAuthToken');
        
        // Redirect to index.html
        window.location.href = 'index.html';
    }
}

// Modal functions
function setupModals() {
    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modals.forEach(modal => modal.style.display = 'none');
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Prescription form
    document.getElementById('prescription-form').addEventListener('submit', handlePrescriptionSubmit);
    
    // Cancel appointment form
    document.getElementById('cancel-form').addEventListener('submit', handleCancelAppointment);
    
    // Reschedule form
    document.getElementById('reschedule-form').addEventListener('submit', handleRescheduleAppointment);
    
    // Confirm appointment form
    document.getElementById('confirm-form').addEventListener('submit', handleConfirmAppointment);
    
    // Add prescription item button
    document.getElementById('add-prescription-item').addEventListener('click', addPrescriptionItem);
}

function showModal(modalId, data = {}) {
    // Hide all modals first
    modals.forEach(modal => modal.style.display = 'none');
    
    // Show the requested modal
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    // Set up modal data based on type
    switch(modalId) {
        case 'prescription-modal':
            setupPrescriptionModal(data);
            break;
        case 'cancel-modal':
            setupCancelModal(data);
            break;
        case 'reschedule-modal':
            setupRescheduleModal(data);
            break;
        case 'confirm-modal':
            setupConfirmModal(data);
            break;
    }
}

function setupPrescriptionModal(data) {
    document.getElementById('prescription-patient-name').textContent = data.patient || '';
    
    // Clear previous items and add one empty prescription item
    const itemsContainer = document.getElementById('prescription-items');
    itemsContainer.innerHTML = '';
    addPrescriptionItem();
}

function addPrescriptionItem() {
    const itemsContainer = document.getElementById('prescription-items');
    const itemIndex = itemsContainer.children.length;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'form-row';
    itemDiv.innerHTML = `
        <div class="form-group">
            <label for="medication-${itemIndex}" class="form-label">Medication</label>
            <input type="text" id="medication-${itemIndex}" class="form-input" placeholder="Medication name" required>
        </div>
        <div class="form-group">
            <label for="dosage-${itemIndex}" class="form-label">Dosage</label>
            <input type="text" id="dosage-${itemIndex}" class="form-input" placeholder="e.g., 10mg" required>
        </div>
        <div class="form-group">
            <label for="frequency-${itemIndex}" class="form-label">Frequency</label>
            <select id="frequency-${itemIndex}" class="form-select" required>
                <option value="">Select</option>
                <option value="once-daily">Once daily</option>
                <option value="twice-daily">Twice daily</option>
                <option value="three-times-daily">Three times daily</option>
                <option value="as-needed">As needed</option>
            </select>
        </div>
    `;
    
    itemsContainer.appendChild(itemDiv);
}

function handlePrescriptionSubmit(e) {
    e.preventDefault();
    
    // In a real app, this would send the prescription to a server
    showNotification('Prescription saved successfully!', 'success');
    document.getElementById('prescription-modal').style.display = 'none';
}

function setupCancelModal(data) {
    document.getElementById('cancel-patient-name').textContent = data.patient || '';
    document.getElementById('cancel-appointment-time').textContent = `${data.time} on ${data.date}` || '';
    document.getElementById('cancel-appointment-id').value = data.id || '';
}

function handleCancelAppointment(e) {
    e.preventDefault();
    
    const appointmentId = document.getElementById('cancel-appointment-id').value;
    const reason = document.getElementById('cancel-reason').value;
    
    // Find and update the appointment
    const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
    if (appointmentIndex !== -1) {
        appointments[appointmentIndex].status = 'cancelled';
        appointments[appointmentIndex].cancellationReason = reason;
        
        // Update UI
        updateDashboardStats();
        showNotification('Appointment cancelled successfully.', 'success');
    }
    
    document.getElementById('cancel-modal').style.display = 'none';
    document.getElementById('cancel-form').reset();
}

function setupRescheduleModal(data) {
    document.getElementById('reschedule-patient-name').textContent = data.patient || '';
    document.getElementById('reschedule-current-date').textContent = `${data.time} on ${data.date}` || '';
    document.getElementById('reschedule-form').setAttribute('data-appointment-id', data.id || '');
}

function handleRescheduleAppointment(e) {
    e.preventDefault();
    
    const appointmentId = e.target.getAttribute('data-appointment-id');
    const newDate = document.getElementById('reschedule-date').value;
    const newTime = document.getElementById('reschedule-time').value;
    const reason = document.getElementById('reschedule-reason').value;
    
    // Format the new date and time
    const formattedDate = new Date(newDate).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
    const formattedTime = newTime + ':00';
    
    // Find and update the appointment
    const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
    if (appointmentIndex !== -1) {
        appointments[appointmentIndex].date = newDate;
        appointments[appointmentIndex].time = formattedTime;
        appointments[appointmentIndex].rescheduleReason = reason;
        
        // Update UI
        updateDashboardStats();
        showNotification('Appointment rescheduled successfully.', 'success');
    }
    
    document.getElementById('reschedule-modal').style.display = 'none';
    document.getElementById('reschedule-form').reset();
}

function setupConfirmModal(data) {
    document.getElementById('confirm-patient-name').textContent = data.patient || '';
    document.getElementById('confirm-appointment-time').textContent = `${data.time} on ${data.date}` || '';
    document.getElementById('confirm-form').setAttribute('data-request-id', data.id || '');
}

function handleConfirmAppointment(e) {
    e.preventDefault();
    
    const requestId = e.target.getAttribute('data-request-id');
    const notes = document.getElementById('confirm-notes').value;
    
    // Find the request
    const requestIndex = appointmentRequests.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
        const request = appointmentRequests[requestIndex];
        
        // Create a new appointment
        const newAppointment = {
            id: `100${appointments.length + 1}`,
            patient: request.patient,
            time: request.date.split(', ')[1],
            date: formatDateString(request.date),
            reason: request.reason,
            status: 'confirmed',
            notes: notes
        };
        
        // Add to appointments
        appointments.push(newAppointment);
        
        // Remove from requests
        appointmentRequests.splice(requestIndex, 1);
        
        // Update UI
        updateDashboardStats();
        renderAppointmentRequests();
        showNotification('Appointment confirmed successfully.', 'success');
    }
    
    document.getElementById('confirm-modal').style.display = 'none';
    document.getElementById('confirm-form').reset();
}

// Dashboard functions
function setupDashboardInteractions() {
    // Quick action buttons
    document.getElementById('add-availability-btn').addEventListener('click', () => {
        showNotification('Add availability feature would open here', 'info');
    });
    
    document.getElementById('write-prescription-btn').addEventListener('click', () => {
        showModal('prescription-modal', { patient: 'Select a patient' });
    });
    
    document.getElementById('start-teleconsultation-btn').addEventListener('click', () => {
        showNotification('Teleconsultation would start here', 'info');
    });
    
    document.getElementById('view-reports-btn').addEventListener('click', () => {
        showNotification('Reports would open here', 'info');
    });
    
    // Appointment action buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const appointmentId = e.target.closest('.appointment-item').getAttribute('data-appointment-id');
            const appointment = appointments.find(a => a.id === appointmentId);
            
            if (appointment) {
                alert(`Appointment Details:\nPatient: ${appointment.patient}\nTime: ${appointment.time}\nDate: ${appointment.date}\nReason: ${appointment.reason}`);
            }
        });
    });
    
    document.querySelectorAll('.cancel-appointment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const appointmentId = e.target.closest('.appointment-item').getAttribute('data-appointment-id');
            const appointment = appointments.find(a => a.id === appointmentId);
            
            if (appointment) {
                showModal('cancel-modal', appointment);
            }
        });
    });
}

function updateDashboardStats() {
    // Update today's appointments count
    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const todaysAppointments = appointments.filter(a => {
        const appointmentDate = new Date(a.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        return appointmentDate === today && a.status === 'confirmed';
    });
    
    document.querySelector('.dashboard-card:nth-child(1) .stat-number').textContent = todaysAppointments.length;
    document.querySelector('.dashboard-card:nth-child(1) p').textContent = 
        `You have ${todaysAppointments.length} appointments scheduled for today`;
    
    // Update pending requests count
    document.querySelector('.dashboard-card:nth-child(2) .stat-number').textContent = appointmentRequests.length;
    document.querySelector('.dashboard-card:nth-child(2) p').textContent = 
        `${appointmentRequests.length} appointment requests awaiting your approval`;
}

// Appointment requests functions
function setupAppointmentRequests() {
    // Filter dropdowns
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', renderAppointmentRequests);
    });
    
    // Render initial requests
    renderAppointmentRequests();
}

function renderAppointmentRequests() {
    const requestsContainer = document.querySelector('.requests-container');
    const statusFilter = document.querySelector('.filter-select:first-child').value;
    const dateFilter = document.querySelector('.filter-select:last-child').value;
    
    // Filter requests based on selections
    let filteredRequests = [...appointmentRequests];
    
    if (statusFilter !== 'All Requests') {
        filteredRequests = filteredRequests.filter(request => {
            if (statusFilter === 'New Patients') return request.type === 'New Patient';
            if (statusFilter === 'Existing Patients') return request.type === 'Existing Patient';
            if (statusFilter === 'Urgent') return request.status === 'urgent';
            return true;
        });
    }
    
    // Note: Date filtering would be more complex in a real app
    
    // Clear container
    requestsContainer.innerHTML = '';
    
    // Add requests to container
    filteredRequests.forEach(request => {
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        requestCard.setAttribute('data-request-id', request.id);
        
        requestCard.innerHTML = `
            <div class="request-info">
                <h3>${request.patient}</h3>
                <p><strong>Reason:</strong> ${request.reason}</p>
                <p><strong>Preferred Date:</strong> ${request.date}</p>
                <p><strong>Type:</strong> ${request.type}</p>
                <span class="request-status status-${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
            </div>
            <div class="request-actions">
                <button class="btn btn-primary approve-btn">Approve</button>
                <button class="btn btn-outline reschedule-btn">Reschedule</button>
                <button class="btn btn-outline decline-btn">Decline</button>
            </div>
        `;
        
        requestsContainer.appendChild(requestCard);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const requestId = e.target.closest('.request-card').getAttribute('data-request-id');
            const request = appointmentRequests.find(r => r.id === requestId);
            
            if (request) {
                showModal('confirm-modal', request);
            }
        });
    });
    
    document.querySelectorAll('.reschedule-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const requestId = e.target.closest('.request-card').getAttribute('data-request-id');
            const request = appointmentRequests.find(r => r.id === requestId);
            
            if (request) {
                showModal('reschedule-modal', request);
            }
        });
    });
    
    document.querySelectorAll('.decline-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const requestId = e.target.closest('.request-card').getAttribute('data-request-id');
            
            if (confirm('Are you sure you want to decline this appointment request?')) {
                // Remove the request
                const requestIndex = appointmentRequests.findIndex(r => r.id === requestId);
                if (requestIndex !== -1) {
                    appointmentRequests.splice(requestIndex, 1);
                    
                    // Update UI
                    updateDashboardStats();
                    renderAppointmentRequests();
                    showNotification('Appointment request declined.', 'success');
                }
            }
        });
    });
}

// Schedule functions
function setupScheduleInteractions() {
    // Week navigation
    document.querySelector('.prev-week-btn').addEventListener('click', () => {
        showNotification('Previous week would be shown', 'info');
    });
    
    document.querySelector('.next-week-btn').addEventListener('click', () => {
        showNotification('Next week would be shown', 'info');
    });
    
    // Add blockout time
    document.getElementById('add-blockout-btn').addEventListener('click', () => {
        showNotification('Add blockout time feature would open here', 'info');
    });
    
    // Appointment clicks
    document.querySelectorAll('.appointment').forEach(appointment => {
        appointment.addEventListener('click', () => {
            const appointmentId = appointment.getAttribute('data-appointment-id');
            const appointmentData = appointments.find(a => a.id === appointmentId);
            
            if (appointmentData) {
                alert(`Appointment Details:\nPatient: ${appointmentData.patient}\nTime: ${appointmentData.time}\nReason: ${appointmentData.reason}`);
            }
        });
    });
}

// Patient records functions
function setupPatientRecords() {
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-box .btn');
    
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (searchTerm) {
            const filteredPatients = patients.filter(patient => 
                patient.name.toLowerCase().includes(searchTerm) ||
                patient.patientId.toLowerCase().includes(searchTerm) ||
                patient.conditions.toLowerCase().includes(searchTerm)
            );
            
            renderPatients(filteredPatients);
            showNotification(`Found ${filteredPatients.length} patients matching "${searchTerm}"`, 'success');
        } else {
            renderPatients(patients);
        }
    });
    
    // Press Enter to search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // Render initial patients
    renderPatients(patients);
}

function renderPatients(patientsArray) {
    const patientsContainer = document.querySelector('.patients-container');
    
    // Clear container
    patientsContainer.innerHTML = '';
    
    // Add patients to container
    patientsArray.forEach(patient => {
        const patientCard = document.createElement('div');
        patientCard.className = 'patient-card';
        patientCard.setAttribute('data-patient-id', patient.id);
        
        patientCard.innerHTML = `
            <div class="patient-header">
                <div class="patient-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="patient-info">
                    <h3>${patient.name}</h3>
                    <p>ID: ${patient.patientId} • Age: ${patient.age} • Last visit: ${patient.lastVisit}</p>
                </div>
            </div>
            <div class="patient-details">
                <div class="detail-item">
                    <span class="detail-label">Condition:</span>
                    <span>${patient.conditions}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Medications:</span>
                    <span>${patient.medications}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Next Appointment:</span>
                    <span>${patient.nextAppointment}</span>
                </div>
            </div>
            <div class="patient-actions">
                <button class="btn btn-outline view-history-btn">View Full History</button>
                <button class="btn btn-primary add-notes-btn">Add Notes</button>
                <button class="btn btn-primary write-prescription-btn">Write Prescription</button>
            </div>
        `;
        
        patientsContainer.appendChild(patientCard);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-history-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const patientId = e.target.closest('.patient-card').getAttribute('data-patient-id');
            const patient = patients.find(p => p.id === patientId);
            
            if (patient) {
                alert(`Full medical history for ${patient.name} would open here.`);
            }
        });
    });
    
    document.querySelectorAll('.add-notes-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const patientId = e.target.closest('.patient-card').getAttribute('data-patient-id');
            const patient = patients.find(p => p.id === patientId);
            
            if (patient) {
                const notes = prompt(`Add notes for ${patient.name}:`);
                if (notes !== null) {
                    showNotification('Notes added successfully.', 'success');
                }
            }
        });
    });
    
    document.querySelectorAll('.write-prescription-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const patientId = e.target.closest('.patient-card').getAttribute('data-patient-id');
            const patient = patients.find(p => p.id === patientId);
            
            if (patient) {
                showModal('prescription-modal', { patient: patient.name });
            }
        });
    });
}

// Dark mode functions
function setupDarkMode() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.checked = true;
        darkModeToggleMobile.checked = true;
    }
    
    // Desktop toggle
    darkModeToggle.addEventListener('change', (e) => {
        toggleDarkMode(e.target.checked);
        darkModeToggleMobile.checked = e.target.checked;
    });
    
    // Mobile toggle
    darkModeToggleMobile.addEventListener('change', (e) => {
        toggleDarkMode(e.target.checked);
        darkModeToggle.checked = e.target.checked;
    });
}

function toggleDarkMode(isDark) {
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
}

// Utility functions
function loadSavedData() {
    // In a real app, this would load data from a server or localStorage
    console.log('Loading saved data...');
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Show notification
    notification.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function formatDateString(dateString) {
    // Simple date formatting for demo purposes
    if (dateString === 'Tomorrow, 10:00 AM') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
    
    // Fallback for other date formats
    return '2023-06-15';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
    
    // Load data from localStorage if available
    if (localStorage.getItem('appointments')) {
        appointments = JSON.parse(localStorage.getItem('appointments'));
    }
    
    if (localStorage.getItem('appointmentRequests')) {
        appointmentRequests = JSON.parse(localStorage.getItem('appointmentRequests'));
    }
    
    updateDashboardStats();
    renderAppointmentRequests();
});
