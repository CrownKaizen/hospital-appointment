// DOM Elements
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeToggleMobile = document.getElementById('dark-mode-toggle-mobile');
const navIcon = document.querySelector('.nav-icon');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const notification = document.getElementById('notification');
const contactForm = document.getElementById('contact-form');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const logoutBtn = document.getElementById('logout-btn');
const logoutBtnMobile = document.getElementById('logout-btn-mobile');
const bookAppointmentBtn = document.getElementById('book-appointment-btn');
const bookDoctorBtns = document.querySelectorAll('.book-doctor-btn');
const bookingModal = document.getElementById('booking-modal');
const closeModal = document.querySelector('.close-modal');
const bookingForm = document.getElementById('booking-form');

// App State
let currentUser = null;
let isLoggedIn = false;

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  if (savedTheme === 'dark') {
    darkModeToggle.checked = true;
    darkModeToggleMobile.checked = true;
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Show notification
  showNotification(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`);
}

// Authentication Functions
function initAuth() {
  // Check if user is logged in
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    isLoggedIn = true;
    navigateTo('dashboard');
  } else {
    navigateTo('auth');
  }
}

function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  // Simple validation
  if (!email || !password) {
    showNotification('Please fill in all fields', 3000);
    return;
  }
  
  // Simulate login process
  showNotification('Logging in...', 2000);
  
  // Create user object (in a real app, this would come from an API)
  currentUser = {
    id: Date.now(),
    name: email.split('@')[0],
    email: email,
    joinDate: new Date().toLocaleDateString()
  };
  
  // Save to localStorage
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  isLoggedIn = true;
  
  // Navigate to dashboard after a delay
  setTimeout(() => {
    navigateTo('dashboard');
    showNotification('Login successful! Welcome back.', 3000);
  }, 2000);
}

function handleSignup(e) {
  e.preventDefault();
  
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  
  // Simple validation
  if (!name || !email || !password || !confirmPassword) {
    showNotification('Please fill in all fields', 3000);
    return;
  }
  
  if (password !== confirmPassword) {
    showNotification('Passwords do not match', 3000);
    return;
  }
  
  if (!document.getElementById('terms-agree').checked) {
    showNotification('Please agree to the terms and conditions', 3000);
    return;
  }
  
  // Simulate signup process
  showNotification('Creating account...', 2000);
  
  // Create user object (in a real app, this would be sent to an API)
  currentUser = {
    id: Date.now(),
    name: name,
    email: email,
    joinDate: new Date().toLocaleDateString()
  };
  
  // Save to localStorage
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  isLoggedIn = true;
  
  // Navigate to dashboard after a delay
  setTimeout(() => {
    navigateTo('dashboard');
    showNotification('Account created successfully! Welcome to City Hospital.', 3000);
  }, 2000);
}

// FIXED: Logout function now redirects to index.html
function handleLogout() {
  // Clear user data
  localStorage.removeItem('currentUser');
  currentUser = null;
  isLoggedIn = false;
  
  // Redirect to index.html
  window.location.href = 'index.html';
}

// Navigation
function toggleMobileMenu() {
  const isExpanded = navIcon.getAttribute('aria-expanded') === 'true';
  navIcon.setAttribute('aria-expanded', !isExpanded);
  mobileMenu.hidden = isExpanded;
  
  // Animate hamburger icon
  const hamburger = document.querySelector('.hamburger');
  if (!isExpanded) {
    hamburger.style.transform = 'rotate(45deg)';
    hamburger.style.backgroundColor = 'var(--primary-color)';
    hamburger.before.style.transform = 'rotate(-45deg) translate(-5px, 6px)';
    hamburger.after.style.opacity = '0';
  } else {
    hamburger.style.transform = '';
    hamburger.style.backgroundColor = '';
    hamburger.before.style.transform = '';
    hamburger.after.style.opacity = '';
  }
}

function navigateTo(pageId) {
  // Update active page
  pages.forEach(page => {
    page.classList.remove('active');
    if (page.id === pageId) {
      page.classList.add('active');
      
      // Add animations to elements on the new page
      setTimeout(() => {
        const animatedElements = page.querySelectorAll('.animated');
        animatedElements.forEach((el, index) => {
          el.style.animationDelay = `${index * 0.2}s`;
        });
      }, 100);
    }
  });
  
  // Update active nav link
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === pageId) {
      link.classList.add('active');
    }
  });
  
  // Close mobile menu if open
  if (!mobileMenu.hidden) {
    toggleMobileMenu();
  }
  
  // Scroll to top
  window.scrollTo(0, 0);
  
  // Update page title
  const pageTitle = document.querySelector(`[data-page="${pageId}"]`)?.textContent || 'City Hospital';
  document.title = `City Hospital - ${pageTitle}`;
}

// Auth Tabs
function switchAuthTab(tabName) {
  authTabs.forEach(tab => {
    if (tab.getAttribute('data-tab') === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  authForms.forEach(form => {
    if (form.id === `${tabName}-form`) {
      form.classList.add('active');
    } else {
      form.classList.remove('active');
    }
  });
}

// Modal Functions
function openBookingModal(doctorId) {
  // Get doctor info (in a real app, this would come from an API)
  const doctors = {
    1: { name: 'Dr. Mina Myoui', specialty: 'Cardiology' },
    2: { name: 'Dr. Fahlada Thananusak', specialty: 'Dermatology' },
    3: { name: 'Dr. Cherran Trakulwipatkul', specialty: 'Neurology' },
    4: { name: 'Dr. Baek Gang Hyeok', specialty: 'Pediatrics' }
  };
  
  const doctor = doctors[doctorId];
  
  // Update modal content
  document.getElementById('booking-doctor-name').textContent = doctor.name;
  document.getElementById('booking-doctor-specialty').textContent = doctor.specialty;
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('booking-date').min = today;
  
  // Show modal
  bookingModal.style.display = 'block';
}

function closeBookingModal() {
  bookingModal.style.display = 'none';
  bookingForm.reset();
}

function handleBooking(e) {
  e.preventDefault();
  
  const date = document.getElementById('booking-date').value;
  const time = document.getElementById('booking-time').value;
  const reason = document.getElementById('booking-reason').value;
  
  if (!date || !time || !reason) {
    showNotification('Please fill in all fields', 3000);
    return;
  }
  
  if (!document.getElementById('booking-confirm').checked) {
    showNotification('Please confirm you will arrive 15 minutes early', 3000);
    return;
  }
  
  // Simulate booking process
  showNotification('Booking your appointment...', 2000);
  
  // Close modal and reset form after a delay
  setTimeout(() => {
    closeBookingModal();
    showNotification('Appointment booked successfully!', 3000);
    
    // Navigate to appointments page
    navigateTo('appointments');
  }, 2000);
}

// Notification System
function showNotification(message, duration = 3000) {
  notification.textContent = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}

// Form Handling
function handleContactForm(e) {
  e.preventDefault();
  
  // Simple validation
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value;
  
  if (!name || !email || !subject || !message) {
    showNotification('Please fill in all fields', 3000);
    return;
  }
  
  // Simulate form submission
  showNotification('Your message has been sent! We will get back to you soon.', 5000);
  contactForm.reset();
}

// Initialize animations
function initAnimations() {
  const animatedElements = document.querySelectorAll('.animated');
  animatedElements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.2}s`;
  });
}

// Initialize appointment functionality
function initAppointments() {
  const cancelButtons = document.querySelectorAll('.appointment-actions .btn-outline');
  
  cancelButtons.forEach(button => {
    button.addEventListener('click', function() {
      const appointmentItem = this.closest('.appointment-item, .appointment-card');
      const doctorName = appointmentItem.querySelector('div:not(.appointment-time)')?.textContent || 
                         appointmentItem.querySelector('h3')?.textContent;
      
      if (confirm(`Are you sure you want to cancel your appointment with ${doctorName}?`)) {
        // Add some animation before removing
        appointmentItem.style.opacity = '0';
        appointmentItem.style.transform = 'translateX(-100px)';
        appointmentItem.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
          appointmentItem.remove();
          showNotification('Appointment cancelled successfully');
        }, 500);
      }
    });
  });
}

// Notification functions for patients
function checkForNotifications() {
    // In a real app, this would check with a server
    // For demo, we'll use localStorage
    const patientName = "Chou Tzuyu"; // This would come from authentication
    const notifications = JSON.parse(localStorage.getItem('patientNotifications') || '{}');
    const patientNotifications = notifications[patientName] || [];
    
    const unreadNotifications = patientNotifications.filter(n => !n.read);
    
    if (unreadNotifications.length > 0) {
        showNotificationIndicator(unreadNotifications.length);
        
        // Display the latest notification
        const latestNotification = unreadNotifications[unreadNotifications.length - 1];
        showNotification(latestNotification.message, latestNotification.type);
        
        // Mark as read
        patientNotifications.forEach(notification => {
            notification.read = true;
        });
        
        notifications[patientName] = patientNotifications;
        localStorage.setItem('patientNotifications', JSON.stringify(notifications));
    }
}

function showNotificationIndicator(count) {
    // Create or update notification indicator
    let indicator = document.getElementById('notification-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'notification-indicator';
        indicator.style.position = 'fixed';
        indicator.style.top = '10px';
        indicator.style.right = '10px';
        indicator.style.backgroundColor = '#ef4444';
        indicator.style.color = 'white';
        indicator.style.borderRadius = '50%';
        indicator.style.width = '20px';
        indicator.style.height = '20px';
        indicator.style.display = 'flex';
        indicator.style.alignItems = 'center';
        indicator.style.justifyContent = 'center';
        indicator.style.fontSize = '12px';
        indicator.style.fontWeight = 'bold';
        indicator.style.zIndex = '1000';
        indicator.style.cursor = 'pointer';
        
        indicator.addEventListener('click', () => {
            showAllNotifications();
        });
        
        document.body.appendChild(indicator);
    }
    
    indicator.textContent = count;
    indicator.style.display = 'flex';
}

function showAllNotifications() {
    const patientName = "Chou Tzuyu";
    const notifications = JSON.parse(localStorage.getItem('patientNotifications') || '{}');
    const patientNotifications = notifications[patientName] || [];
    
    const notificationList = patientNotifications
        .filter(n => !n.read)
        .map(n => `${new Date(n.timestamp).toLocaleString()}: ${n.message}`)
        .join('\n\n');
    
    if (notificationList) {
        alert(`You have notifications:\n\n${notificationList}`);
        
        // Mark all as read
        patientNotifications.forEach(notification => {
            notification.read = true;
        });
        
        notifications[patientName] = patientNotifications;
        localStorage.setItem('patientNotifications', JSON.stringify(notifications));
        
        // Hide indicator
        const indicator = document.getElementById('notification-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    } else {
        alert('You have no new notifications.');
    }
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

// Initialize the application
function init() {
    // Initialize theme
    initTheme();
    
    // Initialize auth
    initAuth();
    
    // Initialize animations
    initAnimations();
    
    // Initialize functionality
    initAppointments();
    
    // Initialize notification system
    if (typeof NotificationSystem !== 'undefined') {
        window.notificationSystem = new NotificationSystem();
    }
    
    // Set up notification event listeners
    setupNotificationListeners();
    
    // Check for notifications
    checkForNotifications();
    
    // Set up event listeners
    darkModeToggle.addEventListener('change', toggleTheme);
    darkModeToggleMobile.addEventListener('change', toggleTheme);
    
    navIcon.addEventListener('click', toggleMobileMenu);
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            
            // Check if user is logged in for protected pages
            if (pageId !== 'auth' && !isLoggedIn) {
                showNotification('Please log in to access this page', 3000);
                navigateTo('auth');
                return;
            }
            
            navigateTo(pageId);
        });
    });
    
    // Auth tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchAuthTab(tabName);
        });
    });
    
    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Logout buttons
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    if (logoutBtnMobile) {
        logoutBtnMobile.addEventListener('click', handleLogout);
    }
    
    // Booking functionality
    if (bookAppointmentBtn) {
        bookAppointmentBtn.addEventListener('click', function() {
            navigateTo('find-doctor');
        });
    }
    
    bookDoctorBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const doctorId = this.getAttribute('data-doctor-id');
            openBookingModal(doctorId);
        });
    });
    
    // Modal functionality
    if (closeModal) {
        closeModal.addEventListener('click', closeBookingModal);
    }
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === bookingModal) {
            closeBookingModal();
        }
    });
    
    // Add some interactive effects to cards
    const cards = document.querySelectorAll('.dashboard-card, .doctor-card, .appointment-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.offsetLeft;
            const y = e.clientY - e.target.offsetTop;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !mobileMenu.hidden) {
            toggleMobileMenu();
        }
        
        if (e.key === 'Escape' && bookingModal.style.display === 'block') {
            closeBookingModal();
        }
    });
    
    // Add current year to footer
    document.querySelector('footer .container').innerHTML = `&copy; ${new Date().getFullYear()} City Hospital. All rights reserved.`;
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
