// Notification System
class NotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        this.userId = localStorage.getItem('userId') || 'user_' + Math.random().toString(36).substr(2, 9);
        this.userRole = this.detectUserRole();
        
        // Initialize user ID if not set
        if (!localStorage.getItem('userId')) {
            localStorage.setItem('userId', this.userId);
        }
        
        this.init();
        this.setupEventListeners();
        this.simulateRealTimeNotifications();
    }
    
    // Detect user role based on page URL or other indicators
    detectUserRole() {
        if (window.location.pathname.includes('patient_portal')) return 'patient';
        if (window.location.pathname.includes('doctor_portal')) return 'doctor';
        if (window.location.pathname.includes('admin_dashboard')) return 'admin';
        return 'unknown';
    }
    
    init() {
        this.updateNotificationCount();
        this.renderNotifications();
    }
    
    setupEventListeners() {
        // Toggle notification panel
        const notificationBells = document.querySelectorAll('#notification-bell, #notification-bell-mobile');
        notificationBells.forEach(bell => {
            bell.addEventListener('click', () => this.toggleNotificationPanel());
        });
        
        // Clear all notifications
        const clearBtn = document.getElementById('clear-notifications');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAllNotifications());
        }
        
        // Close notification panel when clicking outside
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notification-panel');
            const bell = document.getElementById('notification-bell');
            const mobileBell = document.getElementById('notification-bell-mobile');
            
            if (panel && panel.classList.contains('active') && 
                !panel.contains(e.target) && 
                !bell.contains(e.target) && 
                !mobileBell.contains(e.target)) {
                panel.classList.remove('active');
            }
        });
    }
    
    toggleNotificationPanel() {
        const panel = document.getElementById('notification-panel');
        if (panel) {
            panel.classList.toggle('active');
            
            // Mark all as read when opening
            if (panel.classList.contains('active')) {
                this.markAllAsRead();
            }
        }
    }
    
    addNotification(notification) {
        // Add timestamp if not provided
        if (!notification.timestamp) {
            notification.timestamp = new Date().toISOString();
        }
        
        // Add ID if not provided
        if (!notification.id) {
            notification.id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        // Set as unread by default
        notification.read = false;
        
        this.notifications.unshift(notification);
        this.saveNotifications();
        this.updateNotificationCount();
        this.renderNotifications();
        
        // Show toast notification for important events
        if (notification.important) {
            this.showToast(notification);
        }
        
        // Send to other users if needed
        if (notification.recipients && notification.recipients.length > 0) {
            this.sendToOtherUsers(notification);
        }
    }
    
    sendToOtherUsers(notification) {
        // In a real app, this would use WebSockets or a server API
        // For this demo, we'll simulate it by storing in localStorage with a special key
        const crossUserNotifications = JSON.parse(localStorage.getItem('crossUserNotifications')) || [];
        
        notification.recipients.forEach(recipient => {
            const userNotification = {...notification};
            delete userNotification.recipients;
            userNotification.recipientId = recipient.id;
            userNotification.recipientRole = recipient.role;
            
            crossUserNotifications.push(userNotification);
        });
        
        localStorage.setItem('crossUserNotifications', JSON.stringify(crossUserNotifications));
    }
    
    checkForIncomingNotifications() {
        // Check for notifications intended for this user
        const crossUserNotifications = JSON.parse(localStorage.getItem('crossUserNotifications')) || [];
        const userNotifications = [];
        const remainingNotifications = [];
        
        crossUserNotifications.forEach(notification => {
            if (notification.recipientId === this.userId || notification.recipientRole === this.userRole) {
                userNotifications.push(notification);
            } else {
                remainingNotifications.push(notification);
            }
        });
        
        // Add notifications for this user
        if (userNotifications.length > 0) {
            userNotifications.forEach(notification => {
                this.addNotification(notification);
            });
            
            // Update localStorage with remaining notifications
            localStorage.setItem('crossUserNotifications', JSON.stringify(remainingNotifications));
        }
    }
    
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateNotificationCount();
            this.renderNotifications();
        }
    }
    
    markAllAsRead() {
        this.notifications.forEach(notification => {
            notification.read = true;
        });
        
        this.saveNotifications();
        this.updateNotificationCount();
        this.renderNotifications();
    }
    
    clearAllNotifications() {
        this.notifications = [];
        this.saveNotifications();
        this.updateNotificationCount();
        this.renderNotifications();
    }
    
    updateNotificationCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Update all notification count elements
        const countElements = document.querySelectorAll('.notification-count');
        countElements.forEach(el => {
            el.textContent = unreadCount;
            el.style.display = unreadCount > 0 ? 'flex' : 'none';
        });
    }
    
    renderNotifications() {
        const notificationList = document.getElementById('notification-list');
        if (!notificationList) return;
        
        if (this.notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }
        
        notificationList.innerHTML = this.notifications.map(notification => {
            const timeAgo = this.getTimeAgo(notification.timestamp);
            const icon = this.getNotificationIcon(notification.type);
            const readClass = notification.read ? '' : 'unread';
            
            return `
                <div class="notification-item ${readClass}" data-id="${notification.id}">
                    <div class="notification-icon">${icon}</div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${timeAgo}</div>
                        ${notification.actions ? `
                            <div class="notification-actions">
                                ${notification.actions.map(action => 
                                    `<button class="btn btn-outline btn-small" data-action="${action.type}">${action.label}</button>`
                                ).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to notification items
        const notificationItems = notificationList.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.notification-actions')) {
                    const notificationId = item.getAttribute('data-id');
                    this.markAsRead(notificationId);
                    
                    // Handle navigation if specified
                    const notification = this.notifications.find(n => n.id === notificationId);
                    if (notification && notification.navigateTo) {
                        window.location.href = notification.navigateTo;
                    }
                }
            });
        });
        
        // Add event listeners to action buttons
        const actionButtons = notificationList.querySelectorAll('.notification-actions button');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const notificationId = button.closest('.notification-item').getAttribute('data-id');
                const actionType = button.getAttribute('data-action');
                this.handleNotificationAction(notificationId, actionType);
            });
        });
    }
    
    handleNotificationAction(notificationId, actionType) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        switch(actionType) {
            case 'view':
                if (notification.navigateTo) {
                    window.location.href = notification.navigateTo;
                }
                break;
            case 'approve':
                this.approveAppointment(notification);
                break;
            case 'reject':
                this.rejectAppointment(notification);
                break;
            // Add more action handlers as needed
        }
        
        this.markAsRead(notificationId);
    }
    
    approveAppointment(notification) {
        // In a real app, this would make an API call
        console.log('Approving appointment:', notification);
        
        // Show success message
        this.showToast({
            title: 'Appointment Approved',
            message: 'The appointment has been successfully approved.',
            type: 'success'
        });
        
        // Notify the patient
        this.createPatientNotification(
            notification.patientId, 
            'Appointment Confirmed',
            `Your appointment with Dr. ${notification.doctorName} has been confirmed for ${notification.appointmentTime}.`,
            'appointment'
        );
    }
    
    rejectAppointment(notification) {
        // In a real app, this would make an API call
        console.log('Rejecting appointment:', notification);
        
        // Show info message
        this.showToast({
            title: 'Appointment Rejected',
            message: 'The appointment has been rejected.',
            type: 'info'
        });
        
        // Notify the patient
        this.createPatientNotification(
            notification.patientId, 
            'Appointment Not Available',
            `Unfortunately, your requested appointment time with Dr. ${notification.doctorName} is not available. Please choose another time.`,
            'appointment'
        );
    }
    
    createPatientNotification(patientId, title, message, type) {
        const notification = {
            title,
            message,
            type,
            timestamp: new Date().toISOString(),
            important: true,
            recipients: [
                {
                    id: patientId,
                    role: 'patient'
                }
            ]
        };
        
        this.sendToOtherUsers(notification);
    }
    
    getNotificationIcon(type) {
        const icons = {
            appointment: '<i class="fas fa-calendar-check"></i>',
            message: '<i class="fas fa-comment"></i>',
            alert: '<i class="fas fa-exclamation-circle"></i>',
            success: '<i class="fas fa-check-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        
        return icons[type] || icons.info;
    }
    
    getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        } else {
            return past.toLocaleDateString();
        }
    }
    
    showToast(notification) {
        const toast = document.getElementById('notification-toast');
        if (!toast) return;
        
        const icon = this.getNotificationIcon(notification.type);
        
        toast.className = `notification-toast ${notification.type || 'info'}`;
        toast.innerHTML = `
            <div class="notification-toast-content">
                <div class="notification-toast-icon">${icon}</div>
                <div class="notification-toast-message">
                    <strong>${notification.title}</strong><br>
                    ${notification.message}
                </div>
            </div>
        `;
        
        toast.style.display = 'block';
        
        // Hide toast after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                toast.style.display = 'none';
                toast.style.animation = '';
            }, 300);
        }, 5000);
    }
    
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }
    
    simulateRealTimeNotifications() {
        // Check for new notifications every 3 seconds
        setInterval(() => {
            this.checkForIncomingNotifications();
        }, 3000);
        
        // Simulate some notifications for demo purposes
        if (this.notifications.length === 0) {
            setTimeout(() => {
                // Add welcome notification
                this.addNotification({
                    title: 'Welcome to the Portal',
                    message: 'You can manage your appointments and notifications here.',
                    type: 'info',
                    important: false
                });
                
                // If doctor, simulate appointment requests
                if (this.userRole === 'doctor') {
                    setTimeout(() => {
                        this.addNotification({
                            title: 'New Appointment Request',
                            message: 'Chou Tzuyu requested an appointment for tomorrow at 10:00 AM.',
                            type: 'appointment',
                            important: true,
                            patientId: 'patient_123',
                            doctorName: 'Dr. Myoui',
                            appointmentTime: 'Tomorrow at 10:00 AM',
                            actions: [
                                { type: 'approve', label: 'Approve' },
                                { type: 'reject', label: 'Reject' }
                            ]
                        });
                    }, 2000);
                }
                
                // If patient, simulate appointment confirmation
                if (this.userRole === 'patient') {
                    setTimeout(() => {
                        this.addNotification({
                            title: 'Appointment Confirmed',
                            message: 'Your appointment with Dr. Myoui has been confirmed for tomorrow at 10:00 AM.',
                            type: 'appointment',
                            important: true,
                            navigateTo: '#appointments'
                        });
                    }, 2000);
                }
                
                // If admin, simulate system notifications
                if (this.userRole === 'admin') {
                    setTimeout(() => {
                        this.addNotification({
                            title: 'System Update Available',
                            message: 'A new system update is available for installation.',
                            type: 'info',
                            important: false
                        });
                    }, 2000);
                }
            }, 1000);
        }
    }
}

// Initialize notification system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notificationSystem = new NotificationSystem();
});