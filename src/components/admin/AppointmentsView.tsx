'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
const localGsap = typeof window !== 'undefined' && window.gsap ? window.gsap : { fromTo: () => {}, to: () => {}, registerPlugin: () => {}, ScrollTrigger: { getAll: () => ({ forEach: () => {} }) } };
const localScrollTrigger = typeof window !== 'undefined' && window.ScrollTrigger ? window.ScrollTrigger : { getAll: () => ({ forEach: () => {} }) };

// Register GSAP plugins (using local aliases)
if (typeof window !== 'undefined' && localGsap.registerPlugin) {
    localGsap.registerPlugin(localScrollTrigger)
}

// 1. Mock Supabase client
const supabase = {
    from: () => ({
        select: () => ({
            order: () => Promise.resolve({ data: [
                { id: '1', patient_id: 'p1', doctor_id: 'd1', appointment_date: '2024-11-01', appointment_time: '10:00', status: 'accepted', reason: 'Annual check-up for elevated blood pressure.', patients: { users: { name: 'Alice Johnson', email: 'alice@example.com', phone: '555-0101' } }, doctors: { specialization: 'Cardiology', users: { name: 'Dr. Smith', email: 'smith@doc.com', phone: '555-1111' } } },
                { id: '2', patient_id: 'p2', doctor_id: 'd2', appointment_date: '2024-11-05', appointment_time: '14:30', status: 'pending', reason: 'Follow up on a recent X-ray result.', patients: { users: { name: 'Bob Williams', email: 'bob@example.com' } }, doctors: { specialization: 'Orthopedics', users: { name: 'Dr. Brown', email: 'brown@doc.com' } } },
                { id: '3', patient_id: 'p3', doctor_id: 'd1', appointment_date: '2024-10-29', appointment_time: '09:00', status: 'completed', reason: 'Consultation for sleep disorder.', patients: { users: { name: 'Charlie Davis', email: 'charlie@example.com' } }, doctors: { specialization: 'Cardiology', users: { name: 'Dr. Smith', email: 'smith@doc.com' } } },
            ], error: null }),
            delete: () => Promise.resolve({ error: null }),
            insert: (data) => Promise.resolve({ error: null }),
        }),
    }),
};

// 2. Mock Authentication function
const getCurrentUser = () => Promise.resolve({ id: 'mock-user-id' });

// 3. Mock Icons component (using Lucide icons as fallback)
const Icons = {
    calendar: (props) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>,
    search: (props) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></svg>,
    plus: (props) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>,
    x: (props) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>,
    check: (props) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    user: (props) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    stethoscope: (props) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4h4a2 2 0 0 1 2 2" /><path d="M15 9.5a5 5 0 1 1 5 5" /><path d="M21 21L16 16" /></svg>,
    clock: (props) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    mail: (props) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>,
    trash: (props) => <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>,
};
// --- END MOCK / FALLBACK DEFINITIONS ---

// --- TYPE DEFINITIONS (Unchanged) ---
type Appointment = {
    id: string
    patient_id: string
    doctor_id: string
    appointment_date: string
    appointment_time: string
    reason?: string
    status: string
    patients?: {
        id: string
        users?: {
            name: string
            email: string
            phone?: string
        }
    }
    doctors?: {
        id: string
        specialization?: string
        users?: {
            name: string
            email: string
            phone?: string
        }
    }
}

type Doctor = {
    id: string
    user_id: string
    specialization?: string
    users?: {
        id: string
        name: string
        email: string
    }
}

type Patient = {
    id: string
    user_id: string
    users?: {
        id: string
        name: string
        email: string
    }
}

type AppointmentsViewProps = {
    searchTerm: string
    setSearchTerm: (term: string) => void
}

type Notification = {
    text: string
    type: 'success' | 'error' | 'info'
}

// --- Main Appointments View Component ---

function AppointmentsView({ searchTerm, setSearchTerm }: AppointmentsViewProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [showForm, setShowForm] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        reason: ''
    })

    // Custom non-blocking Message/Alert State
    const [notification, setNotification] = useState<Notification | null>(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)


    const containerRef = useRef<HTMLDivElement>(null)
    const tableRef = useRef<HTMLDivElement>(null)
    const heroRef = useRef<HTMLDivElement>(null)
    const floatingIconRef = useRef<HTMLDivElement>(null)

    // Helper to display notification for a short period
    const showMessage = useCallback((text: string, type: Notification['type']) => {
        setNotification({ text, type });
        setTimeout(() => setNotification(null), 4000);
    }, []);

    // --- Data Loading Functions ---
    const loadAppointments = useCallback(async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('appointments')
            .select(`*, patients (id, users:user_id (name, email, phone)), doctors (id, users:user_id (name, email, phone), specialization)`)
            .order('appointment_date', { ascending: false })

        if (!error && data) {
            setAppointments(data as Appointment[])
        }
        setIsLoading(false)
    }, [])

    const loadDoctors = useCallback(async () => {
        const { data } = await supabase
            .from('doctors')
            .select(`*, users:user_id (id, name, email)`)
        if (data) setDoctors(data as Doctor[])
    }, [])

    const loadPatients = useCallback(async () => {
        const { data } = await supabase
            .from('patients')
            .select(`*, users:user_id (id, name, email)`)
        if (data) setPatients(data as Patient[])
    }, [])


    // --- Lifecycle and Animations ---
    useEffect(() => {
        loadAppointments()
        loadDoctors()
        loadPatients()
        
        // Poll for updates every 10 seconds (for mock data, this is informational)
        const interval = setInterval(() => {
            loadAppointments()
        }, 10000)
        
        return () => clearInterval(interval)
    }, [loadAppointments, loadDoctors, loadPatients])

    useEffect(() => {
        // Initialize GSAP animations
        if (containerRef.current) {
            initAnimations()
        }
    }, [appointments])

    const initAnimations = () => {
        if (!localGsap || !localScrollTrigger) return; // Skip if mocks are being used

        // Clear old ScrollTriggers before creating new ones (important for re-renders)
        localScrollTrigger.getAll().forEach(t => t.kill());
        
        // Hero text fade in
        localGsap.fromTo(heroRef.current, 
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        )

        // Table row animations
        localGsap.fromTo(".appointment-row",
            { opacity: 0, x: -30 },
            {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: tableRef.current,
                    start: "top 90%", // Adjusted for better mobile trigger
                    toggleActions: "play none none reverse"
                }
            }
        )

        // Floating icon zig-zag animation (Responsive check: only run if the element is visible/defined)
        if (floatingIconRef.current && window.innerWidth > 768) { // Disable on small screens for performance/simplicity
            localGsap.to(floatingIconRef.current, {
                motionPath: {
                    path: [
                        { x: 0, y: 0 },
                        { x: 100, y: -50 },
                        { x: 200, y: 50 },
                        { x: 300, y: -30 },
                        { x: 400, y: 40 }
                    ],
                    curviness: 1.5
                },
                rotation: 360,
                duration: 20,
                ease: "power1.inOut",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            })
        }

        // Parallax background effect
        localGsap.to(".parallax-bg", {
            yPercent: -30,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        })
    }

    // --- Event Handlers (Updated to use custom messages) ---

    const handleDeleteConfirmation = (appointmentId: string) => {
        setDeleteId(appointmentId);
        setConfirmAction(() => async () => {
            const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
            
            if (error) {
                showMessage('Error deleting appointment', 'error');
            } else {
                showMessage('Appointment deleted successfully!', 'success');
                loadAppointments();
            }
            setShowConfirm(false);
            setDeleteId(null);
        });
        setShowConfirm(true);
    }

    const handleSendReminder = async (appointment: Appointment) => {
        try {
            // Mocking the fetch call since we don't have a real API endpoint
            console.log('Sending reminder (Mocked) to:', appointment.patients?.users?.email);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

            // Assume success for the mock
            showMessage('Reminder sent successfully!', 'success');
        } catch {
            showMessage('Error sending reminder', 'error');
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            showMessage('Error: User not logged in', 'error')
            return
        }
        
        const { error } = await supabase.from('appointments').insert({
            patient_id: formData.patient_id,
            doctor_id: formData.doctor_id,
            appointment_date: formData.appointment_date,
            appointment_time: formData.appointment_time,
            reason: formData.reason,
            status: 'pending',
            created_by: currentUser.id
        })

        if (error) {
            console.error('Error creating appointment:', error)
            showMessage('Error creating appointment: ' + (error.message || 'Unknown error'), 'error')
            return
        }

        showMessage('Appointment scheduled successfully!', 'success')
        setShowForm(false)
        setFormData({ patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', reason: '' })
        loadAppointments()
    }
    
    // --- Utility Functions (Unchanged) ---
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
            case 'accepted': return 'bg-green-500/20 text-green-300 border-green-500/40'
            case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/40'
            case 'rescheduled': return 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            case 'completed': return 'bg-gray-500/20 text-gray-300 border-gray-500/40'
            default: return 'bg-gray-500/20 text-gray-300 border-gray-500/40'
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    }

    // --- Filtered Appointments ---
    const filteredAppointments = appointments
        .filter(appointment => {
            if (!searchTerm) return true
            const search = searchTerm.toLowerCase()
            return (
                appointment.patients?.users?.name?.toLowerCase().includes(search) ||
                appointment.doctors?.users?.name?.toLowerCase().includes(search) ||
                appointment.status?.toLowerCase().includes(search) ||
                appointment.reason?.toLowerCase().includes(search) ||
                appointment.appointment_date?.includes(searchTerm)
            )
        })

    // --- UI Components ---

    const NotificationToast = () => (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`fixed top-4 right-4 z-[100] p-4 rounded-xl shadow-2xl backdrop-blur-md max-w-sm w-full font-semibold ${
                        notification.type === 'success' ? 'bg-green-600/80 text-white' :
                        notification.type === 'error' ? 'bg-red-600/80 text-white' :
                        'bg-blue-600/80 text-white'
                    } flex items-center gap-3`}
                    role="alert"
                >
                    {notification.type === 'success' && <Icons.check className="w-5 h-5" />}
                    {notification.type === 'error' && <Icons.x className="w-5 h-5" />}
                    {notification.text}
                </motion.div>
            )}
        </AnimatePresence>
    )

    const ConfirmationModal = () => (
        <AnimatePresence>
            {showConfirm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-gray-800 border-2 border-red-500/50 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6"
                    >
                        <div className="flex items-center gap-4 text-red-400">
                            <Icons.trash className="w-8 h-8" />
                            <h3 className="text-xl md:text-2xl font-bold text-white">Confirm Deletion</h3>
                        </div>
                        <p className="text-gray-300">
                            Are you sure you want to delete this appointment? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowConfirm(false)}
                                className="px-5 py-2.5 rounded-xl text-gray-300 bg-gray-700/50 hover:bg-gray-700 transition-all"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => confirmAction?.()}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-red-500/30 transition-all"
                            >
                                Delete Appointment
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return (
        <div 
            ref={containerRef}
            className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-violet-950 relative overflow-hidden font-sans"
        >
            <NotificationToast />
            <ConfirmationModal />
            
            {/* Animated Background Elements */}
            <div className="parallax-bg absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Floating Icon with GSAP Animation (Hidden on mobile) */}
            <div
                ref={floatingIconRef}
                className="hidden lg:fixed top-20 right-20 z-10 opacity-20"
            >
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Icons.calendar className="w-6 h-6 text-white" />
                </div>
            </div>

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <motion.div
                    ref={heroRef}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-10 md:mb-16"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        {/* Title and Description */}
                        <div className="flex items-center gap-4">
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shrink-0"
                            >
                                <Icons.calendar className="w-7 h-7 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent leading-tight">
                                    Appointments
                                </h1>
                                <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage and schedule patient appointments</p>
                            </div>
                        </div>
                        
                        {/* Actions: Search and Button */}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full md:w-auto">
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative flex-1 min-w-[180px] sm:min-w-[280px]"
                            >
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Icons.search className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search appointments..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-xl text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 shadow-lg"
                                />
                            </motion.div>

                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowForm(!showForm)}
                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white shadow-xl transition-all duration-300 w-full sm:w-auto text-sm sm:text-base ${
                                    showForm 
                                        ? 'bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-500 hover:to-pink-600' 
                                        : 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600'
                                }`}
                            >
                                {showForm ? (
                                    <>
                                        <Icons.x className="w-5 h-5" />
                                        Cancel
                                    </>
                                ) : (
                                    <>
                                        <Icons.plus className="w-5 h-5" />
                                        Schedule Appointment
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Appointment Form (Now fully responsive and using dark controls) */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="mb-8"
                        >
                            <motion.form 
                                onSubmit={handleSubmit}
                                className="p-6 sm:p-8 bg-gray-800/40 backdrop-blur-lg border border-gray-700/50 rounded-2xl md:rounded-3xl space-y-6 shadow-2xl"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.div variants={itemVariants} className="flex items-center gap-4 pb-4 border-b border-gray-700/50">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl">
                                        <Icons.calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white">Schedule New Appointment</h3>
                                </motion.div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    {[
                                        {
                                            label: "Select Patient *",
                                            name: "patient_id",
                                            type: "select",
                                            options: patients.map(p => ({ value: p.id, label: `${p.users?.name || 'Unknown Patient'} - ${p.users?.email}` }))
                                        },
                                        {
                                            label: "Select Doctor *",
                                            name: "doctor_id",
                                            type: "select",
                                            options: doctors.map(d => ({ value: d.id, label: `Dr. ${d.users?.name || 'Unknown Doctor'} - ${d.specialization}` }))
                                        },
                                        {
                                            label: "Appointment Date *",
                                            name: "appointment_date",
                                            type: "date"
                                        },
                                        {
                                            label: "Appointment Time *",
                                            name: "appointment_time",
                                            type: "time"
                                        }
                                    ].map((field, index) => (
                                        <motion.div
                                            key={field.name}
                                            variants={itemVariants}
                                            custom={index}
                                            className="space-y-2"
                                        >
                                            <label className="block text-sm font-semibold text-gray-300">
                                                {field.label}
                                            </label>
                                            {field.type === 'select' ? (
                                                <select
                                                    required
                                                    value={formData[field.name as keyof typeof formData]}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-700/50 appearance-none backdrop-blur-md border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 cursor-pointer"
                                                >
                                                    <option value="" className="bg-gray-900">Choose...</option>
                                                    {field.options?.map(option => (
                                                        <option key={option.value} value={option.value} className="bg-gray-900">
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type}
                                                    required
                                                    value={formData[field.name as keyof typeof formData]}
                                                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-700/50 appearance-none backdrop-blur-md border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                                                />
                                            )}
                                        </motion.div>
                                    ))}
                                    
                                    <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
                                        <label className="block text-sm font-semibold text-gray-300">
                                            Reason for Visit
                                        </label>
                                        <textarea
                                            value={formData.reason}
                                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-md border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 resize-none"
                                            rows={3}
                                            placeholder="Describe the reason for this appointment..."
                                        />
                                    </motion.div>
                                </div>

                                <motion.button
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)" }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold text-sm shadow-xl transition-all duration-300"
                                >
                                    <Icons.check className="w-5 h-5" />
                                    Schedule Appointment
                                </motion.button>
                            </motion.form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Appointments Table (Responsive using overflow-x-auto) */}
                <motion.div
                    ref={tableRef}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden"
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                            <p className="ml-4 text-cyan-400 font-medium">Loading appointments...</p>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">
                            <Icons.calendar className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                            <p className="text-xl font-semibold">No appointments found.</p>
                            {searchTerm && <p className="mt-2 text-sm">Try adjusting your search query.</p>}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700/50">
                                <thead className="bg-gray-700/40">
                                    <tr>
                                        {['Patient', 'Doctor', 'Date', 'Time', 'Status', 'Reason', 'Actions'].map((header, index) => (
                                            <th 
                                                key={header}
                                                // Added min-w classes to ensure columns don't compress too much
                                                className={`px-6 py-4 text-left text-xs font-bold text-gray-300 uppercase tracking-wider ${header === 'Reason' ? 'min-w-[150px]' : ''} ${header === 'Actions' ? 'min-w-[180px]' : ''}`}
                                            >
                                                <motion.span
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    {header}
                                                </motion.span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {filteredAppointments.map((appointment, index) => (
                                        <motion.tr
                                            key={appointment.id}
                                            className="appointment-row hover:bg-gray-700/20 transition-all duration-300 group"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <motion.div 
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shrink-0"
                                                    >
                                                        <Icons.user className="w-5 h-5 text-white" />
                                                    </motion.div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-white truncate max-w-[150px]">{appointment.patients?.users?.name}</div>
                                                        <div className="text-xs text-gray-400 truncate max-w-[150px]">{appointment.patients?.users?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <motion.div 
                                                        whileHover={{ scale: 1.1, rotate: -5 }}
                                                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0"
                                                    >
                                                        <Icons.stethoscope className="w-5 h-5 text-white" />
                                                    </motion.div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-white truncate max-w-[150px]">Dr. {appointment.doctors?.users?.name}</div>
                                                        <div className="text-xs text-gray-400 truncate max-w-[150px]">{appointment.doctors?.specialization}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Icons.calendar className="w-4 h-4" />
                                                    {appointment.appointment_date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Icons.clock className="w-4 h-4" />
                                                    {appointment.appointment_time}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <motion.span 
                                                    whileHover={{ scale: 1.05 }}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-full border ${getStatusColor(appointment.status)}`}
                                                >
                                                    {appointment.status}
                                                </motion.span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400 max-w-xs xl:max-w-md">
                                                <p className="truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                                                    {appointment.reason || 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3)" }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleSendReminder(appointment)}
                                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-xl font-semibold text-xs shadow-lg transition-all min-w-[80px]"
                                                    >
                                                        <Icons.mail className="w-4 h-4" />
                                                        Remind
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)" }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDeleteConfirmation(appointment.id)}
                                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-600 to-pink-700 text-white rounded-xl font-semibold text-xs shadow-lg transition-all min-w-[80px]"
                                                    >
                                                        <Icons.trash className="w-4 h-4" />
                                                        Delete
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

// Wrapper component to provide context for the default export.
const App = () => {
    const [searchTerm, setSearchTerm] = useState('');
    return (
        // The main layout wrapper
        <div className="min-h-screen bg-gray-950">
            <AppointmentsView searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
    );
};

export default App;
