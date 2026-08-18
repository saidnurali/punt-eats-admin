import React, { useState } from 'react'
import { supabase } from './lib/supabase'
import {
  Bell,
  Car,
  ChevronDown,
  ChevronRight,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  Package,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Store,
  Filter,
  Star,
  Phone,
  Truck,
  FileText,
  MapPin,
  X,
  XCircle,
  Trash2,
  Edit3,
  Flame
} from 'lucide-react'

const normalizeCategory = (cat: string) => {
  if (!cat) return '';
  return cat.replace(/[^\w\s&]/gi, '').trim().split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const safeRenderItems = (items: any) => {
  if (!items) return 'No items';
  
  // Handle string payload fallback
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch {
      return items;
    }
  }

  // Ensure items is an array
  if (!Array.isArray(items)) return 'Invalid items format';

  return items.map((item: any, idx: number) => {
    if (!item) return null;
    
    // Extract base fields safely using optional chaining
    const qty = item?.quantity || 1;
    const rawName = item?.name || item?.title || 'Food Item';
    const variantName = item?.selected_variant?.name || item?.variant || '';
    
    // Extract addons array safely
    const addonsArray = Array.isArray(item?.selected_addons) ? item.selected_addons : [];
    const addonsText = addonsArray.map((a: any) => a?.name || a).filter(Boolean).join(', ');

    // Build pretty name string
    let formattedText = `${qty}x ${rawName}`;
    if (variantName && !rawName.includes(variantName)) {
      formattedText += ` (${variantName})`;
    }
    if (addonsText && !rawName.includes(addonsText)) {
      formattedText += ` + [${addonsText}]`;
    }

    return (
      <div key={idx} className="text-sm font-medium text-gray-800 py-0.5">
        {formattedText}
      </div>
    );
  });
};

// ─── TYPES & DATA STRUCTURES ───
type RecentOrder = {
  id: string
  customer: string
  restaurant: string
  amount: string
  status: 'Preparing' | 'On the Way' | 'Delivered'
  time: string
}

type LiveTaxiRide = {
  id: string
  passenger: string
  driver?: string
  fare?: string
  route: string
  status: 'On the Way' | 'Arrived' | 'Completed'
  time: string
}

type ActivityItem = {
  id: number
  title: string
  subtitle: string
  time: string
  iconType: 'order' | 'ride' | 'progress'
}

const FOOD_CATEGORIES = [
  'Pizza',
  'Burger',
  'Chicken',
  'Rice',
  'Shawarma',
  'Pasta',
  'BBQ & Grill',
  'Coffee & Tea',
  'Desserts',
  'Drinks',
  'Somali Food'
] as const

export type AddOn = { id: string; name: string; description: string; price: string; image: string };
export type Variant = { id: string; option_name: string; price: string; is_default: boolean };

type MenuItem = {
  id: number | string
  name: string
  category: string
  price: string
  stock: string
  restaurantName: string
  imageUrl: string
  images?: string[]
  rating: string
  description?: string
  prepTime?: string
  calories?: string
  add_ons?: AddOn[]
  variants?: Variant[]
  category_id?: string
}

type FoodOrder = {
  id: string
  dbId: string
  customerName: string
  restaurant: string
  items: string
  rawItems?: any[]
  address: string
  total: string
  status: 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled'
  driver?: string
  driverName?: string
  driverPhone?: string
  time: string
  phone: string
  paymentMethod?: string
  rejection_reason?: string
}

type PartnerRestaurant = {
  id: string
  name: string
  emoji: string
  rating: string
  ordersCount: string
  status: 'Active' | 'Inactive'
  address: string
  phone: string
  deliveryTime: string
  categoryFocus?: string
  deliveryFee?: string
  coverImage?: string
  logoImage?: string
  minOrder?: string
}

// ─── INITIAL FALLBACK STATE BEFORE SUPABASE SYNC ───

const initialLiveRides: LiveTaxiRide[] = []
const initialActivity: ActivityItem[] = []
const initialMenu: MenuItem[] = []



const systemStatus = [
  { service: 'Server Status', status: 'All Systems Operational' },
  { service: 'SMS Service', status: 'Operational' },
  { service: 'Payment Gateway', status: 'Operational' },
]


// ─── PUNTGO BRAND LOGO COMPONENT ───
function PuntGoLogo({ size = 'md', variant = 'light' }: { size?: 'sm' | 'md' | 'lg', variant?: 'dark' | 'light' }) {
  const iconSizes = { sm: 26, md: 36, lg: 44 }
  const titleClasses = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }

  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className="relative flex items-center justify-center rounded-2xl shadow-md transition-transform duration-300 hover:scale-105"
        style={{ width: iconSizes[size] + 8, height: iconSizes[size] + 8 }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 5C25.147 5 5 25.147 5 50C5 68.6 16.4 84.6 32 91.5V68H24V32H50C62.15 32 72 41.85 72 54C72 66.15 62.15 76 50 76H40V94.8C43.25 94.93 46.6 95 50 95C74.853 95 95 74.853 95 50C95 25.147 74.853 5 50 5Z" fill="#16A34A" />
          <path d="M32 32H50C62.15 32 72 41.85 72 54C72 66.15 62.15 76 50 76H32V32Z" fill="#044C34" />
          <circle cx="53" cy="54" r="14" fill="#F5A623" />
        </svg>
      </div>
      <div className="flex flex-col">
        <div className={`font-black tracking-tight ${titleClasses[size]} leading-none flex items-center`}>
          <span className={variant === 'light' ? 'text-white' : 'text-[#044C34]'}>Punt</span>
          <span className="text-[#F5A623]">Go</span>
        </div>
        <span className={`text-[11px] font-bold tracking-wider mt-1 ${variant === 'light' ? 'text-emerald-200/90' : 'text-slate-500'}`}>
          Admin Dashboard
        </span>
      </div>
    </div>
  )
}

// ─── REVENUE OVERVIEW MULTI-LINE SVG CHART COMPONENT ───
function RevenueOverviewChart() {
  const dates = ['May 13', 'May 14', 'May 15', 'May 16', 'May 17', 'May 18', 'May 19']
  const foodPoints = '40,150 130,135 220,125 310,95 400,120 490,75 560,78'
  const taxiPoints = '40,185 130,175 220,165 310,145 400,150 490,125 560,140'
  const othersPoints = '40,210 130,202 220,205 310,192 400,188 490,188 560,202'

  return (
    <div className="relative w-full pt-4">
      <div className="mb-4 flex flex-wrap items-center gap-6 text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#16A34A] ring-4 ring-[#16A34A]/10" />
          <span className="text-slate-700">Food Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#F5A623] ring-4 ring-[#F5A623]/10" />
          <span className="text-slate-700">Taxi Rides</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#3B82F6] ring-4 ring-[#3B82F6]/10" />
          <span className="text-slate-700">Others</span>
        </div>
      </div>

      <div className="relative h-64 w-full">
        <svg viewBox="0 0 600 240" className="h-full w-full overflow-visible">
          {[40, 90, 140, 190, 230].map((y, idx) => (
            <line key={idx} x1="30" y1={y} x2="570" y2={y} stroke="#E2E8F0" strokeDasharray="4 4" strokeWidth="1" />
          ))}

          <text x="25" y="45" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">2.5K</text>
          <text x="25" y="95" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">2K</text>
          <text x="25" y="145" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">1.5K</text>
          <text x="25" y="195" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">1K</text>
          <text x="25" y="232" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">500</text>

          <polyline fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={foodPoints} />
          <polyline fill="none" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={taxiPoints} />
          <polyline fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={othersPoints} />

          {foodPoints.split(' ').map((pt, i) => {
            const [x, y] = pt.split(',').map(Number)
            return <circle key={`f-${i}`} cx={x} cy={y} r="4.5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" className="transition hover:r-6" />
          })}
          {taxiPoints.split(' ').map((pt, i) => {
            const [x, y] = pt.split(',').map(Number)
            return <circle key={`t-${i}`} cx={x} cy={y} r="4" fill="#F5A623" stroke="#FFFFFF" strokeWidth="2" />
          })}
          {othersPoints.split(' ').map((pt, i) => {
            const [x, y] = pt.split(',').map(Number)
            return <circle key={`o-${i}`} cx={x} cy={y} r="3.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
          })}

          {dates.map((d, i) => {
            const xPos = 40 + i * 86.6
            return (
              <text key={d} x={xPos} y="255" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="600">
                {d}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// ─── ORDERS OVERVIEW DONUT CHART COMPONENT ───
function OrdersOverviewDonut({ totalCount = 1248, foodCount = 811, taxiCount = 437 }: { totalCount?: number; foodCount?: number; taxiCount?: number }) {
  const total = totalCount || 1
  const foodPct = Math.round((foodCount / total) * 100)
  const taxiPct = Math.round((taxiCount / total) * 100)
  const otherPct = Math.max(0, 100 - foodPct - taxiPct)

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-2">
      <div className="relative flex h-48 w-48 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
          <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="18" />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#3B82F6"
            strokeWidth="18"
            strokeDasharray="238.76"
            strokeDashoffset="0"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#F5A623"
            strokeWidth="18"
            strokeDasharray="238.76"
            strokeDashoffset={`${Math.round((otherPct / 100) * 238.76)}`}
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="transparent"
            stroke="#044C34"
            strokeWidth="18"
            strokeDasharray="238.76"
            strokeDashoffset={`${Math.round(((otherPct + taxiPct) / 100) * 238.76)}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-slate-900">{total.toLocaleString()}</span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
        </div>
      </div>

      <div className="mt-4 w-full space-y-2 px-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#044C34]" />
            <span className="text-slate-700">Food Delivery</span>
          </div>
          <span className="text-slate-900">{foodPct}%</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#F5A623]" />
            <span className="text-slate-700">Taxi Rides</span>
          </div>
          <span className="text-slate-900">{taxiPct}%</span>
        </div>
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#3B82F6]" />
            <span className="text-slate-700">Others</span>
          </div>
          <span className="text-slate-900">{otherPct}%</span>
        </div>
      </div>
    </div>
  )
}

const playNotificationSound = () => {
  try {
    const audio = new window.Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('Audio play failed', e));
  } catch (e) {}
};

function PushNotificationsTab() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const PRESETS = [
    { label: 'Offer 20% Off', title: '20% Qiimo Dhimis Maanta! 🍔', body: 'Geli koodhka PUNTEATS20 marka aad amrayso Pizza ama Burger.' },
    { label: 'New Restaurant Added', title: 'Makhaayad Cusub! 🍽️', body: 'Makhaayad cusub ayaa lagu daray app-ka. Hada dalbo cuntada aad jeceshahay!' },
    { label: 'Weather Delay', title: 'Cimilada Darteed 🌧️', body: 'Cimilada oo xun awgeed, waxaa dhici karta in dalabaadka qaar ay soo daahaan. Raali ahow.' },
  ];

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setMessage('Please fill in both title and body.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const { data, error } = await supabase.functions.invoke('send-broadcast-push', {
        body: { title, body },
      });

      if (error) throw error;

      setMessage(`✅ Notification Sent Successfully to ${data?.devices_targeted || 'all'} users!`);
      setTitle('');
      setBody('');
    } catch (err: any) {
      console.error('Push error:', err);
      setMessage('❌ ' + (err.message || 'Failed to send notification'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h3 className="text-xl font-black text-slate-900">Send Custom Push Notification</h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">Reach all users with a custom promotional or system message.</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.includes('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-xs font-extrabold text-slate-900 mb-2">Quick Action Chips</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => { setTitle(preset.title); setBody(preset.body); }}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 hover:bg-emerald-100 transition"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-extrabold text-slate-900 mb-2">Title</label>
            <input
              type="text"
              placeholder="e.g. 20% Qiimo Dhimis Maanta! 🍔"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#044C34]/20 focus:border-[#044C34] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-slate-900 mb-2">Message Body</label>
            <textarea
              placeholder="e.g. Geli koodhka PUNTEATS20..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#044C34]/20 focus:border-[#044C34] text-sm resize-none"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-[#044C34] hover:bg-[#033b29] text-white text-sm font-bold rounded-xl transition shadow-md shadow-[#044C34]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send to All Customers 🚀'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APPLICATION COMPONENT ───
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  const [storeSettings, setStoreSettings] = useState({
    operatingHours: '08:00 AM - 11:30 PM',
    deliveryRadiusKm: '8',
    minOrderAmount: '5.00',
    currency: '$ USD',
    autoAcceptOrders: true,
    soundNotifications: true,
    smsAlerts: true
  })
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false)

  const [email, setEmail] = useState('admin@punteats.so')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loginError, setLoginError] = useState('')

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [selectedRestaurantForMenu, setSelectedRestaurantForMenu] = useState<PartnerRestaurant | null>(null)
  const [editingDishId, setEditingDishId] = useState<string | number | null>(null)
  const [menuModalForm, setMenuModalForm] = useState({
    name: '',
    category: '' as string,
    price: '',
    stock: 'In Stock',
    imageUrl: '',
    imageUrl2: '',
    imageUrl3: '',
    rating: '4.8 ★',
    description: '',
    prepTime: '20 mins',
    calories: '300 kcal',
    add_ons: [] as AddOn[],
    variants: [] as Variant[]
  })

  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [liveRides, setLiveRides] = useState<LiveTaxiRide[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    category: '' as string,
    price: '',
    stock: 'In Stock',
    imageUrl: '',
    imageUrl2: '',
    imageUrl3: '',
    rating: '4.8 ★',
    description: '',
    prepTime: '20 mins',
    calories: '300 kcal',
    add_ons: [] as AddOn[],
    variants: [] as Variant[]
  })
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>(() => {
    try {
      const cached = localStorage.getItem('puntgo_admin_food_items');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [ordersSubTab, setOrdersSubTab] = useState<'food_orders' | 'restaurants'>('food_orders')
  const [orderFilter, setOrderFilter] = useState('All')
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>(() => {
    try {
      const cached = localStorage.getItem('puntgo_admin_orders');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [partnerRestaurants, setPartnerRestaurants] = useState<PartnerRestaurant[]>(() => {
    try {
      const cached = localStorage.getItem('puntgo_admin_restaurants');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [restaurantModalOpen, setRestaurantModalOpen] = useState(false)
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null)
  const [restaurantToDelete, setRestaurantToDelete] = useState<PartnerRestaurant | null>(null)
  
  // Forms
  const [newRestaurantForm, setNewRestaurantForm] = useState({ name: '', emoji: '', address: '', phone: '', categoryFocus: '', deliveryTime: '', deliveryFee: '', coverImage: '', logoImage: '', minOrder: '0' })
  const [manualOrderForm, setManualOrderForm] = useState({ customerName: '', phone: '+252 ', restaurant: 'Pizza House', items: '', address: '', total: '' })
  
  const [manualOrderModalOpen, setManualOrderModalOpen] = useState(false)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<FoodOrder | null>(null)
  const [orderMessages, setOrderMessages] = useState<any[]>([])
  const [newAdminMessage, setNewAdminMessage] = useState('')
  const [activeOrderTab, setActiveOrderTab] = useState<'details' | 'chat'>('details')
  const [assignDriverOrder, setAssignDriverOrder] = useState<FoodOrder | null>(null)
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>('All')
  const [dbCategories, setDbCategories] = useState<any[]>([])
  const [restaurantDishes, setRestaurantDishes] = useState<MenuItem[]>([])
  
  // Drivers State
  const [drivers, setDrivers] = useState<any[]>([])
  const [driverModalOpen, setDriverModalOpen] = useState(false)
  const [newDriverForm, setNewDriverForm] = useState({ full_name: '', phone: '', pin_code: '', vehicle_type: 'Motorcycle' })
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true)

  // Loading & Error States
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataFetchError, setDataFetchError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [orderPage, setOrderPage] = useState(0);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);

  const handleRetryFetch = () => {
    setIsDataLoading(true);
    setDataFetchError(null);
    setOrderPage(0);
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Custom Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchRestaurantDishes = async (restaurantId: string) => {
    if (!restaurantId) return;
    const { data, error } = await supabase
      .from('food_items')
      .select('*, restaurants(name)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mappedFood: MenuItem[] = data.map((f: any) => ({
        id: f.id,
        name: f.name || 'Dish Name',
        category: f.category || 'Pizza',
        price: typeof f.price === 'number' ? `$${f.price.toFixed(2)}` : `$${Number(f.price || 0).toFixed(2)}`,
        stock: f.availability || 'In Stock',
        restaurantName: f.restaurants?.name || partnerRestaurants.find((r: any) => r.id === f.restaurant_id)?.name || 'Pizza House',
        imageUrl: f.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
        images: Array.isArray(f.images) && f.images.length > 0 ? f.images.filter(Boolean) : (f.image_url ? [f.image_url] : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80']),
        rating: `${f.rating || 4.8} ★`,
        description: f.description || '',
        prepTime: f.prep_time || '20 mins',
        calories: f.calories || '300 kcal',
        category_id: f.category_id || null,
        variants: Array.isArray(f.variants) 
          ? f.variants.map((v: any) => ({ ...v, option_name: v.option_name || v.name || '' })) 
          : (typeof f.variants === 'string' ? (()=>{try{return JSON.parse(f.variants).map((v: any) => ({ ...v, option_name: v.option_name || v.name || '' }))}catch(e){return []}})() : []),
        add_ons: Array.isArray(f.add_ons) 
          ? f.add_ons.map((a: any) => ({ ...a, name: a.name || a.option_name || '' })) 
          : (typeof f.add_ons === 'string' ? (()=>{try{return JSON.parse(f.add_ons).map((a: any) => ({ ...a, name: a.name || a.option_name || '' }))}catch(e){return []}})() : [])
      }));
      setRestaurantDishes(mappedFood);
    } else {
      console.error('Error fetching dishes:', error);
    }
  };

  const [cancelPromptOpen, setCancelPromptOpen] = useState<boolean>(false)
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState<string>('')
  const [customCancelReason, setCustomCancelReason] = useState<string>('')

  const topRestaurantsMap: Record<string, number> = {}
  foodOrders.forEach(o => {
    if (o.restaurant) {
      topRestaurantsMap[o.restaurant] = (topRestaurantsMap[o.restaurant] || 0) + 1
    }
  })
  const derivedTopRestaurants = Object.entries(topRestaurantsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => {
      const r = partnerRestaurants.find(pr => pr.name === name)
      return { name, orders: `${count} Orders`, emoji: r?.emoji || '🏪' }
    })

  const categoryCounts: Record<string, number> = {}
  foodOrders.forEach(o => {
    const itemsLower = o.items.toLowerCase()
    if (itemsLower.includes('pizza')) categoryCounts['Pizza'] = (categoryCounts['Pizza'] || 0) + 1
    else if (itemsLower.includes('burger')) categoryCounts['Burger'] = (categoryCounts['Burger'] || 0) + 1
    else if (itemsLower.includes('somali')) categoryCounts['Somali'] = (categoryCounts['Somali'] || 0) + 1
    else categoryCounts['Other'] = (categoryCounts['Other'] || 0) + 1
  })
  
  const derivedTopCategories = Object.entries(categoryCounts)
    .filter(([name]) => name !== 'Other')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({
      name,
      orders: `${count} Orders`,
      emoji: name === 'Pizza' ? '🍕' : name === 'Burger' ? '🍔' : '🐪'
    }))

  const paymentTotals = {
    'EVC Plus': 0,
    'Zaad': 0,
    'Sahal': 0,
    'Cash on Delivery': 0,
  }
  foodOrders.forEach(o => {
    const amount = parseFloat(o.total.replace(/[^0-9.]/g, '')) || 0
    const method = o.paymentMethod || 'Cash on Delivery'
    if (method.includes('EVC')) paymentTotals['EVC Plus'] += amount
    else if (method.includes('Zaad')) paymentTotals['Zaad'] += amount
    else if (method.includes('Sahal')) paymentTotals['Sahal'] += amount
    else paymentTotals['Cash on Delivery'] += amount
  })

  const derivedPaymentSummary = [
    { provider: 'EVC Plus', amount: `$${paymentTotals['EVC Plus'].toFixed(2)}`, code: 'E9', color: 'bg-emerald-600 text-white' },
    { provider: 'Zaad', amount: `$${paymentTotals['Zaad'].toFixed(2)}`, code: 'Za', color: 'bg-green-500 text-white' },
    { provider: 'Sahal', amount: `$${paymentTotals['Sahal'].toFixed(2)}`, code: 'Sa', color: 'bg-emerald-700 text-white' },
    { provider: 'Cash', amount: `$${paymentTotals['Cash on Delivery'].toFixed(2)}`, code: 'Ca', color: 'bg-slate-700 text-white' },
  ]
  const derivedSystemStatus = [
    { service: 'Server Status', status: 'All Systems Operational' },
    { service: 'SMS Service', status: 'Operational' },
    { service: 'Payment Gateway', status: 'Operational' },
  ]

  React.useEffect(() => {
    if (!selectedOrderDetails) {
      setOrderMessages([]);
      setActiveOrderTab('details');
      return;
    }
    
    let isSubscribed = true;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('order_messages')
        .select('*')
        .eq('order_id', selectedOrderDetails.id)
        .order('created_at', { ascending: true });
      if (isSubscribed && data) setOrderMessages(data);
    };
    fetchMessages();

    const channel = supabase.channel(`chat_${selectedOrderDetails.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${selectedOrderDetails.id}` }, (payload) => {
        setOrderMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
    };
  }, [selectedOrderDetails]);

  const handleSendAdminMessage = async () => {
    if (!newAdminMessage.trim() || !selectedOrderDetails) return;
    const msg = newAdminMessage.trim();
    setNewAdminMessage('');
    
    const { error } = await supabase.from('order_messages').insert([{
      order_id: selectedOrderDetails.id,
      sender_role: 'admin',
      sender_name: 'PuntGo Support',
      text: msg
    }]);
    
    if (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message");
    }
  };



  React.useEffect(() => {
    if (foodOrders.length > 0) {
      try {
        // Limit saved history to only the last 20 orders to prevent quota overflow
        const recentOrders = Array.isArray(foodOrders) ? foodOrders.slice(0, 20) : foodOrders;
        localStorage.setItem('puntgo_admin_orders', JSON.stringify(recentOrders));
      } catch (error) {
        console.warn('LocalStorage quota exceeded, skipping local cache save:', error);
      }
    }
  }, [foodOrders]);

  React.useEffect(() => {
    if (partnerRestaurants.length > 0) {
      try {
        localStorage.setItem('puntgo_admin_restaurants', JSON.stringify(partnerRestaurants));
      } catch (error) {
        console.warn('LocalStorage save failed:', error);
      }
    }
  }, [partnerRestaurants]);

  React.useEffect(() => {
    if (filteredMenu.length > 0) {
      try {
        localStorage.setItem('puntgo_admin_food_items', JSON.stringify(filteredMenu));
      } catch (error) {
        console.warn('LocalStorage save failed:', error);
      }
    }
  }, [filteredMenu]);

  React.useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        setDataFetchError(null);
        // 0. Fetch Categories
        const { data: catData } = await supabase.from('categories').select('id, name').order('name', { ascending: true });
        if (isMounted && catData) {
          setDbCategories(catData);
        }

        // 1. Fetch Restaurants
        const { data: resData } = await supabase.from('restaurants').select('*');
        if (isMounted && resData) {
          const mappedRes: PartnerRestaurant[] = resData.map((r: any) => ({
            id: r.id,
            name: r.name || 'Unknown Restaurant',
            emoji: r.emoji || r.logo_image || '🏪',
            rating: `${r.rating || 4.8} ★`,
            ordersCount: `${r.orders_count || 0} Orders`,
            status: (r.status as 'Active' | 'Inactive') || 'Active',
            address: r.address || 'Garowe Center',
            phone: r.phone || '+252 90 7000000',
            deliveryTime: r.prep_time || '20-30m',
            categoryFocus: r.category || 'Somali Traditional',
            deliveryFee: r.delivery_fee ? (typeof r.delivery_fee === 'number' ? '$' + r.delivery_fee.toFixed(2) : String(r.delivery_fee)) : '$2.00',
            coverImage: r.cover_image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
            logoImage: r.logo_image || r.emoji || '🏪'
          }));
          if (mappedRes.length > 0) {
            setPartnerRestaurants(mappedRes);
          }
        }

        // 2. Fetch Food Items
        const { data: foodData } = await supabase.from('food_items').select('*, restaurants(name)');
        if (isMounted && foodData) {
          const mappedFood: MenuItem[] = foodData.map((f: any) => ({
            id: f.id,
            name: f.name || 'Dish Name',
            category: f.category || 'Pizza',
            price: typeof f.price === 'number' ? `$${f.price.toFixed(2)}` : `$${Number(f.price || 0).toFixed(2)}`,
            stock: f.availability || 'In Stock',
            restaurantName: f.restaurants?.name || mappedRes.find((r: any) => r.id === f.restaurant_id)?.name || 'Pizza House',
            imageUrl: f.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
            images: Array.isArray(f.images) && f.images.length > 0 ? f.images.filter(Boolean) : (f.image_url ? [f.image_url] : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80']),
            rating: `${f.rating || 4.8} ★`,
            description: f.description || '',
            prepTime: f.prep_time || '20 mins',
            calories: f.calories || '300 kcal',
            category_id: f.category_id || null,
            variants: Array.isArray(f.variants) 
              ? f.variants.map((v: any) => ({ ...v, option_name: v.option_name || v.name || '' })) 
              : (typeof f.variants === 'string' ? (()=>{try{return JSON.parse(f.variants).map((v: any) => ({ ...v, option_name: v.option_name || v.name || '' }))}catch(e){return []}})() : []),
            add_ons: Array.isArray(f.add_ons) 
              ? f.add_ons.map((a: any) => ({ ...a, name: a.name || a.option_name || '' })) 
              : (typeof f.add_ons === 'string' ? (()=>{try{return JSON.parse(f.add_ons).map((a: any) => ({ ...a, name: a.name || a.option_name || '' }))}catch(e){return []}})() : [])
          }));
          if (mappedFood.length > 0) {
            setFilteredMenu(mappedFood);
          }
        }

        // 3. Fetch Drivers
        const { data: driversData } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
        if (isMounted && driversData) {
          setDrivers(driversData);
        }

        // 3. Fetch Orders has been moved to a separate useEffect to guarantee independent sync
        if (isMounted) setIsDataLoading(false);
      } catch (err: any) {
        console.error('Error fetching data from Supabase:', err);
        if (isMounted) {
          setDataFetchError(err.message || 'Failed to connect to backend server. Please try again.');
          setIsDataLoading(false);
        }
      }
    };

    fetchAllData();

    const channelTopic = `admin_dashboard_sync_${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase.channel(channelTopic)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'food_items' }, () => {
        if (isMounted) fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, () => {
        if (isMounted) fetchAllData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => {
        if (isMounted) fetchAllData();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && isMounted) {
          fetchAllData();
        } else if ((status === 'CHANNEL_ERROR' || status === 'CLOSED') && isMounted) {
          console.warn('Supabase Realtime Channel Error/Closed. Connection unstable.');
        }
      });

    const handleOnline = () => {
      if (isMounted) {
        setDataFetchError(null);
        setIsDataLoading(true);
        fetchAllData();
      }
    };

    const handleVisibilityChange = () => {
      if (isMounted && document.visibilityState === 'visible') fetchAllData();
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [refreshTrigger]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchLatestOrders = async () => {
      try {
        const from = orderPage * 50;
        const to = from + 49;
        
        const { data, error, count } = await supabase
          .from('orders')
          .select('*, restaurants(name)', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (data && isMounted) {
          const mappedOrd: FoodOrder[] = data.map((o: any) => {
            let itemsStr = '';
            let rawItemsArr: any[] = [];
            if (typeof o.items === 'string') {
              try { rawItemsArr = JSON.parse(o.items); } catch { itemsStr = o.items; }
            } else if (Array.isArray(o.items)) {
              rawItemsArr = o.items;
            }

            if (rawItemsArr.length > 0) {
              itemsStr = rawItemsArr.map((i: any) => {
                const qty = i.quantity || 1;
                const name = i.name || 'Item';
                return `${qty}x ${name}`;
              }).join(', ');
            } else if (typeof o.items === 'object' && o.items !== null) {
              itemsStr = o.items.summary || JSON.stringify(o.items);
            }

            return {
              id: o.order_number || o.id,
              dbId: o.id,
              customerName: o.customer_name || 'Customer',
              restaurant: (() => {
                if (o.restaurant_name && o.restaurant_name !== 'Gsiin biistaro' && o.restaurant_name !== 'PuntEats Restaurant') return o.restaurant_name;
                if (rawItemsArr?.[0]?.restaurant_name) return rawItemsArr[0].restaurant_name;
                if (rawItemsArr?.[0]?.restaurantName) return rawItemsArr[0].restaurantName;
                if (o.restaurants?.name) return o.restaurants.name;
                return o.restaurant_name || 'Restaurant';
              })(),
              items: itemsStr || 'Order items',
              rawItems: rawItemsArr,
              address: o.delivery_address || 'Garowe',
              total: typeof o.total_price === 'number' ? `$${o.total_price.toFixed(2)}` : `$${Number(o.total_price || 0).toFixed(2)}`,
              status: (o.status as any) || 'Pending',
              driver: o.driver_name || o.driver || undefined,
              driverName: o.driver_name || undefined,
              driverPhone: o.driver_phone || undefined,
              time: o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              phone: o.customer_phone || '+252 90 7000000',
              paymentMethod: o.payment_method || 'Cash on Delivery'
            };
          });
          
          if (orderPage === 0) {
            setFoodOrders(mappedOrd);
            const recents: RecentOrder[] = mappedOrd.slice(0, 5).map(o => ({
              id: o.id,
              customer: o.customerName,
              restaurant: o.restaurant,
              amount: o.total,
              status: o.status === 'Delivered' ? 'Delivered' : o.status === 'Out for Delivery' ? 'On the Way' : 'Preparing',
              time: o.time
            }));
            setRecentOrders(recents);
          } else {
            setFoodOrders(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newOrders = mappedOrd.filter(o => !existingIds.has(o.id));
              return [...prev, ...newOrders];
            });
          }
          
          if (count !== null) {
            setHasMoreOrders((orderPage + 1) * 50 < count);
          } else {
            setHasMoreOrders(data.length === 50);
          }
        }
      } catch (err: any) {
        console.error('Error fetching latest orders:', err);
        if (isMounted) setDataFetchError(err.message || 'Orders sync failed. Reconnecting...');
      }
    };

    fetchLatestOrders();

    const subscription = supabase
      .channel('realtime_orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        if (!isMounted) return;
        const o = payload.new;
        let itemsStr = '';
        let rawItemsArr: any[] = [];
        if (typeof o.items === 'string') {
          try { rawItemsArr = JSON.parse(o.items); } catch { itemsStr = o.items; }
        } else if (Array.isArray(o.items)) {
          rawItemsArr = o.items;
        }

        if (rawItemsArr.length > 0) {
          itemsStr = rawItemsArr.map((i: any) => {
            const qty = i.quantity || 1;
            const name = i.name || 'Item';
            return `${qty}x ${name}`;
          }).join(', ');
        } else if (typeof o.items === 'object' && o.items !== null) {
          itemsStr = o.items.summary || JSON.stringify(o.items);
        }

        const mappedOrder: FoodOrder = {
          id: o.order_number || o.id,
          dbId: o.id,
          customerName: o.customer_name || 'Customer',
          restaurant: (() => {
            if (o.restaurant_name && o.restaurant_name !== 'Gsiin biistaro' && o.restaurant_name !== 'PuntEats Restaurant') return o.restaurant_name;
            if (rawItemsArr?.[0]?.restaurant_name) return rawItemsArr[0].restaurant_name;
            if (rawItemsArr?.[0]?.restaurantName) return rawItemsArr[0].restaurantName;
            if (o.restaurants?.name) return o.restaurants.name;
            return o.restaurant_name || 'Restaurant';
          })(),
          items: itemsStr || 'Order items',
          rawItems: rawItemsArr,
          address: o.delivery_address || 'Garowe',
          total: typeof o.total_price === 'number' ? `$${o.total_price.toFixed(2)}` : `$${Number(o.total_price || 0).toFixed(2)}`,
          status: (o.status as any) || 'Pending',
          driver: o.driver || undefined,
          time: o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          phone: o.customer_phone || '+252 90 7000000',
          paymentMethod: o.payment_method || 'Cash on Delivery'
        };

        const recentOrder: RecentOrder = {
          id: mappedOrder.id,
          customer: mappedOrder.customerName,
          restaurant: mappedOrder.restaurant,
          amount: mappedOrder.total,
          status: mappedOrder.status === 'Delivered' ? 'Delivered' : mappedOrder.status === 'Out for Delivery' ? 'On the Way' : 'Preparing',
          time: mappedOrder.time
        };

        setFoodOrders(prev => [mappedOrder, ...prev]);
        setRecentOrders(prev => [recentOrder, ...prev].slice(0, 5));
        
        
        if (o.status === 'Pending') {
          supabase.from('drivers').select('*').eq('is_online', true).limit(1).then(({ data: dList }) => {
            let assigned = { name: 'shiikhdoon', phone: '+252907730148' };
            if (dList && dList.length > 0) {
              assigned = { name: dList[0].full_name, phone: dList[0].phone };
            }
            supabase.from('orders').update({
              driver_name: assigned.name,
              driver_phone: assigned.phone,
              driver: assigned.name,
              status: 'Preparing'
            }).eq('id', o.id).then();
          });
        }

        playNotificationSound();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        if (!isMounted) return;
        const updated = payload.new;
        setFoodOrders(prev => prev.map(o => o.dbId === updated.id ? { 
          ...o, 
          status: updated.status, 
          driver: updated.driver_name || updated.driver,
          driverName: updated.driver_name,
          driverPhone: updated.driver_phone
        } : o));
        setRecentOrders(prev => prev.map(r => (r.id === updated.order_number || r.id === updated.id) ? { ...r, status: updated.status === 'Delivered' ? 'Delivered' : updated.status === 'Out for Delivery' ? 'On the Way' : 'Preparing' } : r));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, (payload) => {
        if (!isMounted) return;
        setFoodOrders(prev => prev.filter(o => o.dbId !== payload.old.id));
        setRecentOrders(prev => prev.filter(r => (r.id !== payload.old.order_number && r.id !== payload.old.id)));
      })
      .subscribe((status) => {
        if ((status === 'CHANNEL_ERROR' || status === 'CLOSED') && isMounted) {
          console.warn('Orders Realtime channel disconnected.');
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, [refreshTrigger, orderPage]);

  React.useEffect(() => {
    if (!autoAssignEnabled || foodOrders.length === 0) return;

    const pendingOrders = foodOrders.filter(o => o.status === 'Pending' && !o.driver);
    if (pendingOrders.length === 0) return;

    const onlineDrivers = drivers.filter(d => d.is_online);

    pendingOrders.forEach(async (order) => {
      let selectedDriver = { id: '', name: 'shiikhdoon', phone: '+252907730148' };
      if (onlineDrivers.length > 0) {
        const d = onlineDrivers[0];
        selectedDriver = { id: d.id, name: d.full_name, phone: d.phone };
      }
      
      await handleAssignDriver(order.id, selectedDriver);
      showToast(`Auto-assigned order ${order.id} to ${selectedDriver.name}`);
    });
  }, [foodOrders, drivers, autoAssignEnabled]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter valid email and password.')
      return
    }
    setLoginError('')
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setActiveTab('overview')
  }

  // Dynamic Form Helpers for `form` (Inline Modal)
  const addFormAddOn = () => {
    const addons = form.add_ons || [];
    if (addons.length >= 10) return;
    setForm({ ...form, add_ons: [...addons, { id: Date.now().toString(), name: '', description: '', price: '', image: '' }] })
  }
  const removeFormAddOn = (id: string) => setForm({ ...form, add_ons: (form.add_ons || []).filter(a => a.id !== id) })
  const updateFormAddOn = (id: string, field: string, value: string) => setForm({ ...form, add_ons: (form.add_ons || []).map(a => a.id === id ? { ...a, [field]: value } : a) })

  const addFormVariant = () => {
    const variants = form.variants || [];
    setForm({ ...form, variants: [...variants, { id: Date.now().toString(), option_name: '', price: '', is_default: variants.length === 0 }] })
  }
  const removeFormVariant = (id: string) => setForm({ ...form, variants: (form.variants || []).filter(v => v.id !== id) })
  const updateFormVariant = (id: string, field: string, value: string | boolean) => setForm({ ...form, variants: (form.variants || []).map(v => v.id === id ? { ...v, [field]: value } : v) })
  const setFormVariantDefault = (id: string) => setForm({ ...form, variants: (form.variants || []).map(v => ({ ...v, is_default: v.id === id })) })

  // Dynamic Form Helpers for `menuModalForm`
  const addMenuModalAddOn = () => {
    const addons = menuModalForm.add_ons || [];
    if (addons.length >= 10) return;
    setMenuModalForm({ ...menuModalForm, add_ons: [...addons, { id: Date.now().toString(), name: '', description: '', price: '', image: '' }] })
  }
  const removeMenuModalAddOn = (id: string) => setMenuModalForm({ ...menuModalForm, add_ons: (menuModalForm.add_ons || []).filter(a => a.id !== id) })
  const updateMenuModalAddOn = (id: string, field: string, value: string) => setMenuModalForm({ ...menuModalForm, add_ons: (menuModalForm.add_ons || []).map(a => a.id === id ? { ...a, [field]: value } : a) })

  const addMenuModalVariant = () => {
    const variants = menuModalForm.variants || [];
    setMenuModalForm({ ...menuModalForm, variants: [...variants, { id: Date.now().toString(), option_name: '', price: '', is_default: variants.length === 0 }] })
  }
  const removeMenuModalVariant = (id: string) => setMenuModalForm({ ...menuModalForm, variants: (menuModalForm.variants || []).filter(v => v.id !== id) })
  const updateMenuModalVariant = (id: string, field: string, value: string | boolean) => setMenuModalForm({ ...menuModalForm, variants: (menuModalForm.variants || []).map(v => v.id === id ? { ...v, [field]: value } : v) })
  const setMenuModalVariantDefault = (id: string) => setMenuModalForm({ ...menuModalForm, variants: (menuModalForm.variants || []).map(v => ({ ...v, is_default: v.id === id })) })

  const [uploadingImage, setUploadingImage] = useState(false);

  const openFoodModal = () => {
    setEditingDishId(null)
    setForm({ name: '', category: '', price: '', stock: 'In Stock', imageUrl: '', imageUrl2: '', imageUrl3: '', rating: '4.8 ★', description: '', prepTime: '20 mins', calories: '300 kcal', add_ons: [], variants: [] })
    setModalOpen(true)
  }

  const handleEditDish = (item: MenuItem) => {
    const imgs = item.images || (item.imageUrl ? [item.imageUrl] : []);
    setEditingDishId(item.id)
    setMenuModalForm({
      name: item.name,
      category: item.category_id || item.category,
      price: item.price.replace('$', ''),
      stock: item.stock,
      imageUrl: imgs[0] || item.imageUrl || '',
      imageUrl2: imgs[1] || '',
      imageUrl3: imgs[2] || '',
      rating: item.rating,
      description: item.description || 'A classic favorite! Indulge in a crispy, fresh preparation topped with rich authentic ingredients and spices.',
      prepTime: item.prepTime || '20 mins',
      calories: item.calories || '300 kcal',
      add_ons: Array.isArray(item.add_ons) ? item.add_ons : [],
      variants: Array.isArray(item.variants) ? item.variants : []
    })
  }

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const variantsCount = form.variants?.length || 0;
    if (!form.name.trim()) {
      showToast("Please enter a name for the food item.");
      return;
    }
    if (variantsCount === 0 && (!form.price || !form.price.trim())) {
      showToast("Please enter a price or add a product variant.");
      return;
    }
    const priceNum = parseFloat(form.price.replace(/[^0-9.]/g, '')) || 0;
    const ratingNum = parseFloat(form.rating.replace(/[^0-9.]/g, '')) || 4.8;
    const restId = selectedRestaurantForMenu?.id || partnerRestaurants.find(r => r.name === 'Pizza House')?.id || null;
    const restName = selectedRestaurantForMenu?.name || partnerRestaurants.find(r => r.id === restId)?.name || 'Pizza House';

    const rawImages = [form.imageUrl.trim(), form.imageUrl2?.trim(), form.imageUrl3?.trim()].filter(Boolean);
    const processedRawImages = await processBase64Images(rawImages);
    const finalImages = processedRawImages.length > 0 ? processedRawImages : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'];

    const hasVariants = form.variants && form.variants.length > 0;
    const finalPrice = hasVariants ? Math.min(...form.variants.map((v: any) => Number(v.price) || 0)) : priceNum;

    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str || '');
    const selectedCategory = dbCategories.find(c => c.id === form.category);
    const categoryName = isUuid(form.category) 
      ? (selectedCategory ? selectedCategory.name : 'Food') 
      : form.category;

    const payload = {
      restaurant_id: restId,
      name: form.name.trim(),
      category: normalizeCategory(categoryName),
      category_id: isUuid(form.category) ? form.category : null,
      price: finalPrice,
      prep_time: form.prepTime.trim() || '20 mins',
      calories: form.calories.trim() || '300 kcal',
      rating: ratingNum,
      image_url: finalImages[0],
      images: finalImages,
      description: form.description.trim() || '',
      availability: form.stock || 'In Stock',
      add_ons: form.add_ons,
      variants: hasVariants ? form.variants : [],
      is_available: true,
      in_stock: true
    };

    try {
      if (editingDishId !== null) {
        const { data, error } = await supabase.from('food_items').update(payload).eq('id', editingDishId).select().single();

        if (error) {
          console.error("Error updating dish:", error);
          showToast(`Error: ${error.message}`);
          return;
        }

        if (data) {
          const updatedItem: MenuItem = {
            id: data.id,
            name: data.name || form.name.trim(),
            category: normalizeCategory(data.category || categoryName),
            price: typeof data.price === 'number' ? `$${data.price.toFixed(2)}` : `$${Number(data.price || priceNum).toFixed(2)}`,
            stock: data.availability || form.stock || 'In Stock',
            restaurantName: restName,
            imageUrl: data.image_url || finalImages[0],
            images: data.images || finalImages,
            rating: `${data.rating || ratingNum} ★`,
            description: data.description || form.description.trim(),
            prepTime: data.prep_time || form.prepTime.trim(),
            calories: data.calories || form.calories.trim(),
            add_ons: data.add_ons || form.add_ons,
            variants: data.variants || form.variants
          };
          setFilteredMenu(prev => prev.map(item => item.id === editingDishId ? updatedItem : item));
        }
        setEditingDishId(null);
        showToast("Dish updated successfully!");
      } else {
        const { data, error } = await supabase.from('food_items').insert([payload]).select().single();

        if (error) {
          console.error("Error adding dish:", error);
          showToast(`Error: ${error.message}`);
          return;
        }

        if (data) {
          const newItem: MenuItem = {
            id: data.id,
            name: data.name || form.name.trim(),
            category: normalizeCategory(data.category || categoryName),
            price: typeof data.price === 'number' ? `$${data.price.toFixed(2)}` : `$${Number(data.price || priceNum).toFixed(2)}`,
            stock: data.availability || form.stock || 'In Stock',
            restaurantName: restName,
            imageUrl: data.image_url || finalImages[0],
            images: data.images || finalImages,
            rating: `${data.rating || ratingNum} ★`,
            description: data.description || form.description.trim(),
            prepTime: data.prep_time || form.prepTime.trim(),
            calories: data.calories || form.calories.trim(),
            add_ons: data.add_ons || form.add_ons,
            variants: data.variants || form.variants
          };
          setFilteredMenu(prev => [...prev, newItem]);
        }
        showToast("Dish added successfully!");
      }
      setForm({ name: '', category: '', price: '', stock: 'In Stock', imageUrl: '', imageUrl2: '', imageUrl3: '', rating: '4.8 ★', description: '', prepTime: '20 mins', calories: '300 kcal', add_ons: [], variants: [] });
      setModalOpen(false);
    } catch (err: any) {
      console.error("Error adding dish:", err);
      showToast(err.message || String(err));
    }
  }

  const handleMenuModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const variantsCount = menuModalForm.variants?.length || 0;
    if (!selectedRestaurantForMenu || !menuModalForm.name.trim()) {
      showToast("Please enter a name for the food item.");
      return;
    }
    if (variantsCount === 0 && (!menuModalForm.price || !menuModalForm.price.trim())) {
      showToast("Please enter a price or add a product variant.");
      return;
    }
    const priceNum = parseFloat(menuModalForm.price.replace(/[^0-9.]/g, '')) || 0;
    const ratingNum = parseFloat(menuModalForm.rating.replace(/[^0-9.]/g, '')) || 4.8;
    const restId = selectedRestaurantForMenu.id;

    const rawImages = [menuModalForm.imageUrl.trim(), menuModalForm.imageUrl2?.trim(), menuModalForm.imageUrl3?.trim()].filter(Boolean);
    const processedRawImages = await processBase64Images(rawImages);
    const finalImages = processedRawImages.length > 0 ? processedRawImages : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'];

    const hasVariants = menuModalForm.variants && menuModalForm.variants.length > 0;
    const finalPrice = hasVariants ? Math.min(...menuModalForm.variants.map((v: any) => Number(v.price) || 0)) : priceNum;

    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str || '');
    const selectedCategory = dbCategories.find(c => c.id === menuModalForm.category);
    const categoryName = isUuid(menuModalForm.category) 
      ? (selectedCategory ? selectedCategory.name : 'Food') 
      : menuModalForm.category;

    const payload = {
      restaurant_id: restId,
      name: menuModalForm.name.trim(),
      category: normalizeCategory(categoryName),
      category_id: isUuid(menuModalForm.category) ? menuModalForm.category : null,
      price: finalPrice,
      prep_time: menuModalForm.prepTime.trim() || '20 mins',
      calories: menuModalForm.calories.trim() || '300 kcal',
      rating: ratingNum,
      image_url: finalImages[0],
      images: finalImages,
      description: menuModalForm.description.trim() || '',
      availability: menuModalForm.stock || 'In Stock',
      add_ons: menuModalForm.add_ons,
      variants: hasVariants ? menuModalForm.variants : [],
      is_available: true,
      in_stock: true
    };

    try {
      if (editingDishId !== null) {
        const { data, error } = await supabase.from('food_items').update(payload).eq('id', editingDishId).select().single();

        if (error) {
          console.error("Error updating dish:", error);
          showToast(`Error: ${error.message}`);
          return;
        }

        if (data) {
          const updatedItem: MenuItem = {
            id: data.id,
            name: data.name || menuModalForm.name.trim(),
            category: normalizeCategory(data.category || categoryName),
            price: typeof data.price === 'number' ? `$${data.price.toFixed(2)}` : `$${Number(data.price || priceNum).toFixed(2)}`,
            stock: data.availability || menuModalForm.stock || 'In Stock',
            restaurantName: selectedRestaurantForMenu.name,
            imageUrl: data.image_url || finalImages[0],
            images: data.images || finalImages,
            rating: `${data.rating || ratingNum} ★`,
            description: data.description || menuModalForm.description.trim(),
            prepTime: data.prep_time || menuModalForm.prepTime.trim(),
            calories: data.calories || menuModalForm.calories.trim(),
            add_ons: data.add_ons || menuModalForm.add_ons,
            variants: data.variants || menuModalForm.variants
          };
          setRestaurantDishes(prev => prev.map(item => item.id === editingDishId ? updatedItem : item));
        }
        setEditingDishId(null);
        showToast("Dish updated successfully!");
      } else {
        const { data, error } = await supabase.from('food_items').insert([payload]).select().single();

        if (error) {
          console.error("Error adding dish:", error);
          showToast(`Error: ${error.message}`);
          return;
        }

        if (data) {
          const newItem: MenuItem = {
            id: data.id,
            name: data.name || menuModalForm.name.trim(),
            category: normalizeCategory(data.category || categoryName),
            price: typeof data.price === 'number' ? `$${data.price.toFixed(2)}` : `$${Number(data.price || priceNum).toFixed(2)}`,
            stock: data.availability || menuModalForm.stock || 'In Stock',
            restaurantName: selectedRestaurantForMenu.name,
            imageUrl: data.image_url || finalImages[0],
            images: data.images || finalImages,
            rating: `${data.rating || ratingNum} ★`,
            description: data.description || menuModalForm.description.trim(),
            prepTime: data.prep_time || menuModalForm.prepTime.trim(),
            calories: data.calories || menuModalForm.calories.trim(),
            add_ons: data.add_ons || menuModalForm.add_ons,
            variants: data.variants || menuModalForm.variants,
            category_id: data.category_id || null
          };
          setRestaurantDishes(prev => [newItem, ...prev]);
        }
        showToast("Dish added successfully!");
      }
      fetchRestaurantDishes(restId);
      setMenuModalForm({ name: '', category: '', price: '', stock: 'In Stock', imageUrl: '', imageUrl2: '', imageUrl3: '', rating: '4.8 ★', description: '', prepTime: '20 mins', calories: '300 kcal', add_ons: [], variants: [] });
      setEditingDishId(null);
    } catch (err: any) {
      console.error("Error adding dish:", err);
      showToast(err.message || String(err));
    }
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetForm: 'quick' | 'quick2' | 'quick3' | 'menu' | 'menu2' | 'menu3' | 'restaurant_cover' | 'restaurant_logo'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const bucket = targetForm.startsWith('restaurant_') ? 'restaurant-images' : 'food-images';
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${targetForm}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        alert(`Failed to upload image to ${bucket}: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      if (targetForm === 'quick') {
        setForm((prev) => ({ ...prev, imageUrl: publicUrl }));
      } else if (targetForm === 'quick2') {
        setForm((prev) => ({ ...prev, imageUrl2: publicUrl }));
      } else if (targetForm === 'quick3') {
        setForm((prev) => ({ ...prev, imageUrl3: publicUrl }));
      } else if (targetForm === 'menu') {
        setMenuModalForm((prev) => ({ ...prev, imageUrl: publicUrl }));
      } else if (targetForm === 'menu2') {
        setMenuModalForm((prev) => ({ ...prev, imageUrl2: publicUrl }));
      } else if (targetForm === 'menu3') {
        setMenuModalForm((prev) => ({ ...prev, imageUrl3: publicUrl }));
      } else if (targetForm === 'restaurant_cover') {
        setNewRestaurantForm((prev) => ({ ...prev, coverImage: publicUrl }));
      } else if (targetForm === 'restaurant_logo') {
        setNewRestaurantForm((prev) => ({ ...prev, logoImage: publicUrl }));
      }
    } catch (err: any) {
      console.error("Error uploading file:", err);
      alert(err.message || String(err));
    } finally {
      setUploadingImage(false);
    }
  }

  const processBase64Images = async (images: string[], bucket: string = 'food-images') => {
    const processed = [];
    for (const img of images) {
      if (img.startsWith('data:image/')) {
        try {
          setUploadingImage(true);
          const res = await fetch(img);
          const blob = await res.blob();
          const fileExt = blob.type.split('/')[1] || 'png';
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const filePath = `uploads/${fileName}`;

          const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, blob, {
            cacheControl: '3600',
            upsert: false,
          });

          if (uploadError) {
            console.error("Storage upload error for base64:", uploadError);
            processed.push(img); // Fallback
          } else {
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            processed.push(data.publicUrl);
          }
        } catch (err) {
          console.error("Error processing base64 image:", err);
          processed.push(img);
        } finally {
          setUploadingImage(false);
        }
      } else {
        processed.push(img);
      }
    }
    return processed;
  };

  const updateOrderStatus = async (orderId: string, newStatus: FoodOrder['status']) => {
    if (newStatus === 'Cancelled') {
      setOrderToCancel(orderId);
      setCancelPromptOpen(true);
      return;
    }
    const orderObj = foodOrders.find(o => o.id === orderId);
    if (orderObj?.dbId) {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderObj.dbId);
    } else {
      await supabase.from('orders').update({ status: newStatus }).eq('order_number', orderId);
    }
  }

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    const finalReason = cancelReason === 'Custom Reason...' ? customCancelReason : cancelReason;
    const orderObj = foodOrders.find(o => o.id === orderToCancel);
    const updatePayload = { 
      status: 'Cancelled', 
      rejection_reason: finalReason || 'Order was cancelled by admin.' 
    };

    try {
      if (orderObj?.dbId) {
        await supabase.from('orders').update(updatePayload).eq('id', orderObj.dbId);
      } else {
        await supabase.from('orders').update(updatePayload).eq('order_number', orderToCancel);
      }
    } catch(err) {
      console.error(err);
    }
    setCancelPromptOpen(false);
    setOrderToCancel(null);
    setCancelReason('');
    setCustomCancelReason('');
  }

  const toggleRestaurantStatus = async (id: string) => {
    const resObj = partnerRestaurants.find(r => r.id === id);
    if (!resObj) return;
    const newStatus = resObj.status === 'Active' ? 'Inactive' : 'Active';
    await supabase.from('restaurants').update({ status: newStatus }).eq('id', id);
  }

  const handleAddRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRestaurantForm.name.trim()) return
    const feeNum = parseFloat(newRestaurantForm.deliveryFee.replace(/[^0-9.]/g, '')) || 2.00;
    const minOrderNum = parseFloat(newRestaurantForm.minOrder.replace(/[^0-9.]/g, '')) || 5.00;

    try {
      if (editingRestaurantId) {
        const { data, error } = await supabase.from('restaurants').update({
          name: newRestaurantForm.name.trim(),
          address: newRestaurantForm.address.trim() || 'Wadajir Road, Near Main Market',
          phone: newRestaurantForm.phone.trim() || '907730148',
          prep_time: newRestaurantForm.deliveryTime || '20-30m',
          category: newRestaurantForm.categoryFocus || 'Somali Traditional & Fast Food',
          delivery_fee: feeNum,
          cover_image: newRestaurantForm.coverImage.trim() || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
          logo_image: newRestaurantForm.logoImage.trim() || newRestaurantForm.emoji || '🏪',
          emoji: newRestaurantForm.logoImage.trim() || newRestaurantForm.emoji || '🏪',
          rating: 4.8
        }).eq('id', editingRestaurantId).select().single();

        if (error) {
          console.error("Error updating restaurant:", error);
          alert(error.message);
          return;
        }

        if (data) {
          const updatedRest: PartnerRestaurant = {
            id: data.id,
            name: data.name || newRestaurantForm.name.trim(),
            emoji: data.emoji || data.logo_image || newRestaurantForm.logoImage || '🏪',
            rating: `${data.rating || 4.8} ★`,
            ordersCount: `${data.orders_count || 0} Orders`,
            status: (data.status as 'Active' | 'Inactive') || 'Active',
            address: data.address || newRestaurantForm.address.trim() || 'Garowe Center',
            phone: data.phone || newRestaurantForm.phone.trim() || '907730148',
            deliveryTime: data.prep_time || newRestaurantForm.deliveryTime || '20-30m',
            categoryFocus: data.category || newRestaurantForm.categoryFocus || 'Somali Traditional & Fast Food',
            deliveryFee: typeof data.delivery_fee === 'number' ? `$${data.delivery_fee.toFixed(2)}` : `$${Number(data.delivery_fee || feeNum).toFixed(2)}`,
            coverImage: data.cover_image || newRestaurantForm.coverImage.trim() || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
            logoImage: data.logo_image || data.emoji || newRestaurantForm.logoImage || '🏪'
          };
          setPartnerRestaurants(prev => prev.map(r => r.id === editingRestaurantId ? updatedRest : r));
        }
        setEditingRestaurantId(null);
        alert("Restaurant updated successfully!");
      } else {
        const { data, error } = await supabase.from('restaurants').insert([{
          name: newRestaurantForm.name.trim(),
          address: newRestaurantForm.address.trim() || 'Wadajir Road, Near Main Market',
          phone: newRestaurantForm.phone.trim() || '907730148',
          prep_time: newRestaurantForm.deliveryTime || '20-30m',
          category: newRestaurantForm.categoryFocus || 'Somali Traditional & Fast Food',
          delivery_fee: feeNum,
          cover_image: newRestaurantForm.coverImage.trim() || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
          logo_image: newRestaurantForm.logoImage.trim() || newRestaurantForm.emoji || '🏪',
          emoji: newRestaurantForm.logoImage.trim() || newRestaurantForm.emoji || '🏪',
          rating: 4.8,
          status: 'Active',
          is_active: true,
          is_featured: true
        }]).select().single();

        if (error) {
          console.error("Error adding restaurant:", error);
          alert(error.message);
          return;
        }

        if (data) {
          const newRest: PartnerRestaurant = {
            id: data.id,
            name: data.name || newRestaurantForm.name.trim(),
            emoji: data.emoji || data.logo_image || newRestaurantForm.logoImage || '🏪',
            rating: `${data.rating || 4.8} ★`,
            ordersCount: `${data.orders_count || 0} Orders`,
            status: (data.status as 'Active' | 'Inactive') || 'Active',
            address: data.address || newRestaurantForm.address.trim() || 'Garowe Center',
            phone: data.phone || newRestaurantForm.phone.trim() || '907730148',
            deliveryTime: data.prep_time || newRestaurantForm.deliveryTime || '20-30m',
            categoryFocus: data.category || newRestaurantForm.categoryFocus || 'Somali Traditional & Fast Food',
            deliveryFee: typeof data.delivery_fee === 'number' ? `$${data.delivery_fee.toFixed(2)}` : `$${Number(data.delivery_fee || feeNum).toFixed(2)}`,
            coverImage: data.cover_image || newRestaurantForm.coverImage.trim() || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
            logoImage: data.logo_image || data.emoji || newRestaurantForm.logoImage || '🏪'
          };
          setPartnerRestaurants(prev => [newRest, ...prev]);
        }
        alert("Restaurant added successfully!");
      }
      setRestaurantModalOpen(false)
      setNewRestaurantForm({ name: '', emoji: '🏪', address: '', phone: '', categoryFocus: 'Somali Traditional & Fast Food', deliveryTime: '20-30m', deliveryFee: '$2.00', coverImage: '', logoImage: '🏪' })
    } catch (err: any) {
      console.error("Error adding restaurant:", err);
      alert(err.message || String(err));
    }
  }

  const openAddRestaurantModal = () => {
    setEditingRestaurantId(null)
    setNewRestaurantForm({ name: '', emoji: '🏪', address: '', phone: '', categoryFocus: 'Somali Traditional & Fast Food', deliveryTime: '20-30m', deliveryFee: '$2.00', coverImage: '', logoImage: '🏪' })
    setRestaurantModalOpen(true)
  }

  const handleEditRestaurant = (res: PartnerRestaurant) => {
    setEditingRestaurantId(res.id)
    setNewRestaurantForm({
      name: res.name,
      emoji: res.emoji || '🏪',
      address: res.address,
      phone: res.phone,
      categoryFocus: res.categoryFocus || 'Somali Traditional & Fast Food',
      deliveryTime: res.deliveryTime || '20-30m',
      deliveryFee: res.deliveryFee || '$2.00',
      coverImage: res.coverImage || '',
      logoImage: res.logoImage || res.emoji || '🏪',
      minOrder: String(res.minOrder || '0')
    })
    setRestaurantModalOpen(true)
  }

  const logAuditAction = async (action: string, entity_id: string, details?: any) => {
    try {
      await supabase.from('audit_logs').insert([{
        admin_name: 'Super Admin',
        action,
        entity_id,
        details
      }]);
    } catch (e) {
      console.warn('Audit log failed (table may not exist):', e);
    }
  };

  const confirmDeleteRestaurant = async () => {
    if (!restaurantToDelete) return
    await supabase.from('restaurants').delete().eq('id', restaurantToDelete.id);
    await logAuditAction('DELETE_RESTAURANT', restaurantToDelete.id, { name: restaurantToDelete.name });
    setRestaurantToDelete(null)
  }

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const handleManualOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmittingOrder) return;
    if (!manualOrderForm.customerName.trim() || !manualOrderForm.items.trim()) return
    
    setIsSubmittingOrder(true);
    try {
      const orderNum = `#ORD-${Math.floor(9000 + Math.random() * 999)}`;
      const totalNum = parseFloat(manualOrderForm.total.replace(/[^0-9.]/g, '')) || 15.00;
      
      const itemsJson = JSON.stringify([{
        name: manualOrderForm.items.trim(),
        quantity: 1,
        base_price: totalNum,
        item_total_price: totalNum,
        restaurant_name: manualOrderForm.restaurant
      }]);

      await supabase.from('orders').insert([{
        order_number: orderNum,
        customer_name: manualOrderForm.customerName.trim(),
        customer_phone: manualOrderForm.phone.trim() || '+252 90 7000000',
        restaurant_name: manualOrderForm.restaurant,
        items: itemsJson,
        total_price: totalNum,
        delivery_address: manualOrderForm.address.trim() || 'Garowe Center',
        status: 'Pending',
        payment_method: 'Manual / Cash on Delivery',
        delivery_fee: 2.00
      }]);
      await logAuditAction('CREATE_MANUAL_ORDER', orderNum, { total: totalNum, customer: manualOrderForm.customerName });
      setManualOrderModalOpen(false)
      setManualOrderForm({ customerName: '', phone: '+252 ', restaurant: 'Pizza House', items: '', address: '', total: '' })
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  const handleAddDriver = async () => {
    if (!newDriverForm.full_name || !newDriverForm.phone || !newDriverForm.pin_code) {
      showToast('Please fill out all required driver fields.');
      return;
    }
    const { error } = await supabase.from('drivers').insert([
      {
        full_name: newDriverForm.full_name,
        phone: newDriverForm.phone,
        pin_code: newDriverForm.pin_code,
        vehicle_type: newDriverForm.vehicle_type,
        is_online: true
      }
    ]);
    if (error) {
      showToast('Error adding driver: ' + error.message);
    } else {
      showToast('Driver added successfully');
      setDriverModalOpen(false);
      setNewDriverForm({ full_name: '', phone: '', pin_code: '', vehicle_type: 'Motorcycle' });
    }
  }

  const handleDeleteDriver = async (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      const { error } = await supabase.from('drivers').delete().eq('id', id);
      if (error) showToast('Error deleting driver: ' + error.message);
      else showToast('Driver deleted');
    }
  }

  const toggleDriverStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('drivers').update({ is_online: !currentStatus }).eq('id', id);
    if (error) showToast('Error updating status: ' + error.message);
  }

  const handleAssignDriver = async (orderId: string, driverInfo: { id?: string; name: string; phone: string }) => {
    const orderObj = foodOrders.find(o => o.id === orderId);
    const updatePayload: any = { 
      status: 'Assigned', 
      driver: driverInfo.name,
      driver_name: driverInfo.name,
      driver_phone: driverInfo.phone
    };
    if (driverInfo.id) {
      updatePayload.driver_id = driverInfo.id;
    }
    
    if (orderObj?.dbId) {
      await supabase.from('orders').update(updatePayload).eq('id', orderObj.dbId);
    } else {
      await supabase.from('orders').update(updatePayload).eq('order_number', orderId);
    }
    await logAuditAction('ASSIGN_DRIVER', orderId, { driver_name: driverInfo.name, driver_id: driverInfo.id });
    setAssignDriverOrder(null)
  }

  const filteredFoodOrdersList = foodOrders.filter((o) => {
    const matchesTab = orderFilter === 'All' || o.status === orderFilter
    const matchesSearch =
      `${o.id} ${o.customerName} ${o.restaurant} ${o.items} ${o.address}`.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const filteredPartnerRestaurantsList = partnerRestaurants.filter((r) =>
    `${r.name} ${r.address} ${r.phone}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cycleRecentOrder = (id: string) => {
    const statuses: RecentOrder['status'][] = ['Preparing', 'On the Way', 'Delivered']
    setRecentOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o
        const nextIdx = (statuses.indexOf(o.status) + 1) % statuses.length
        return { ...o, status: statuses[nextIdx], time: 'Just now' }
      })
    )
  }

  const cycleTaxiRide = (id: string) => {
    const statuses: LiveTaxiRide['status'][] = ['On the Way', 'Arrived', 'Completed']
    setLiveRides((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const nextIdx = (statuses.indexOf(r.status) + 1) % statuses.length
        return { ...r, status: statuses[nextIdx], time: 'Just now' }
      })
    )
  }

  const filteredOrders = recentOrders.filter((o) =>
    `${o.id} ${o.customer} ${o.restaurant}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRides = liveRides.filter((r) =>
    `${r.id} ${r.passenger} ${r.route}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders & Restaurants', icon: Package },
    { id: 'riders', label: 'Riders / Drivers', icon: Truck },
    { id: 'taxi', label: 'Taxi Rides', icon: Car },
    { id: 'notifications', label: 'Push Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const totalRevenueNum = foodOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + parseFloat(o.total.replace(/[^0-9.]/g, '') || '0'), 0)
  const totalRevenueStr = `$${totalRevenueNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const pendingOrdersCount = foodOrders.filter(o => o.status === 'Pending').length
  const activeRestaurantsCount = partnerRestaurants.filter(r => r.status === 'Active').length

  const statCards = [
    {
      title: 'Total Revenue',
      value: totalRevenueStr,
      trend: 'Live sum of active orders',
      icon: ShoppingBag,
      color: 'bg-[#044C34] text-white',
    },
    {
      title: 'Total Orders',
      value: `${foodOrders.length}`,
      trend: `${pendingOrdersCount} currently pending`,
      icon: Package,
      color: 'bg-[#138C48] text-white',
    },
    {
      title: 'Pending Orders',
      value: `${pendingOrdersCount}`,
      trend: 'Awaiting acceptance',
      icon: Clock,
      color: 'bg-amber-500 text-white',
    },
    {
      title: 'Active Restaurants',
      value: `${activeRestaurantsCount} / ${partnerRestaurants.length}`,
      trend: 'Partners currently online',
      icon: Store,
      color: 'bg-emerald-600 text-white',
    },
    {
      title: 'Total Rides',
      value: `${liveRides.length}`,
      trend: 'Live taxi fleet count',
      icon: Car,
      color: 'bg-[#F5A623] text-white',
    },
  ]

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen w-full bg-white text-slate-800 antialiased">
        <div className="flex flex-1 flex-col justify-between px-6 py-10 lg:w-[58%] lg:px-16 xl:px-24">
          <header className="flex items-center justify-between">
            <PuntGoLogo size="md" variant="dark" />
            <button
              onClick={() => setIsLoggedIn(true)}
              className="rounded-xl border border-emerald-600/20 bg-emerald-50 px-4 py-2 text-xs font-bold text-[#044C34] hover:bg-emerald-100 transition"
            >
              Skip to Dashboard →
            </button>
          </header>

          <main className="my-auto mx-auto w-full max-w-md py-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-black tracking-tight text-[#044C34] sm:text-4xl">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Sign in to access the redesigned PuntGo Admin Dashboard
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_20px_50px_-15px_rgba(4,76,52,0.12)] sm:p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                {loginError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail size={18} className="pointer-events-none absolute left-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 transition focus:border-[#044C34] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#044C34]/10"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Password
                    </label>
                    <button type="button" className="text-xs font-semibold text-[#044C34] hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock size={18} className="pointer-events-none absolute left-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-900 transition focus:border-[#044C34] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#044C34]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center pt-1">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-[#044C34] focus:ring-[#044C34]"
                    />
                    <span>Stay signed in for 30 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#044C34] py-4 text-base font-bold text-white shadow-lg shadow-[#044C34]/25 transition hover:bg-[#033b28]"
                >
                  <span>Login to Dashboard</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </div>
          </main>

          <footer className="mt-auto flex items-center justify-center gap-8 border-t border-slate-100 pt-6 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck size={16} />
              <span>Secure SSL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock size={16} />
              <span>Encrypted</span>
            </div>
          </footer>
        </div>

        <div className="hidden w-[42%] flex-col justify-between bg-gradient-to-br from-[#044C34] via-[#066344] to-[#138C48] p-12 text-white lg:flex xl:w-[45%]">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md">
              <Sparkles size={14} className="text-[#F5A623]" />
              <span className="text-xs font-bold uppercase tracking-wider">Garowe HQ System</span>
            </div>
          </div>

          <div className="my-auto space-y-6">
            <h2 className="text-3xl font-black leading-tight">PuntGo Universal Admin</h2>
            <p className="text-sm leading-relaxed text-emerald-100/90">
              Manage food deliveries across 40+ restaurants, dispatch taxi rides across Puntland, approve drivers, and monitor multi-currency payments right from one unified control center.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5A623] font-bold text-white">
                  PG
                </div>
                <div>
                  <p className="text-sm font-bold">Garowe Central Server</p>
                  <p className="text-xs text-emerald-200">v1.0.0 • Active Synchronization</p>
                </div>
              </div>
              <span className="h-3 w-3 rounded-full bg-[#16A34A] ring-4 ring-[#16A34A]/30" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F3F6F8] text-slate-800 antialiased">
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col justify-between bg-[#044C34] p-5 text-white shadow-2xl select-none transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div>
          <div className="mb-8 pl-1">
            <PuntGoLogo size={sidebarCollapsed ? 'sm' : 'md'} variant="light" />
          </div>

          <nav className="space-y-2">
            {sidebarItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  title={sidebarCollapsed ? label : undefined}
                  className={`group flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#138C48] text-white shadow-lg shadow-black/15 translate-x-1'
                      : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon size={19} className={isActive ? 'text-white shrink-0' : 'text-emerald-300 shrink-0'} />
                    {!sidebarCollapsed && <span>{label}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    isActive ? (
                      <span className="h-2 w-2 rounded-full bg-[#F5A623]" />
                    ) : (
                      <ChevronRight size={15} className="opacity-0 transition-opacity group-hover:opacity-100" />
                    )
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-emerald-800/60">
          {!sidebarCollapsed && (
            <div className="rounded-2xl bg-black/20 p-4 backdrop-blur">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#138C48] text-white">
                  <UtensilsCrossed size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold leading-none">PuntGo</p>
                  <p className="text-[10px] text-emerald-300 mt-1">Making life easier</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex items-center gap-2 text-xs font-bold text-emerald-200/80 hover:text-white transition px-1"
          >
            <span>{sidebarCollapsed ? '>' : '< Collapse'}</span>
          </button>
        </div>
      </aside>

      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white px-8 shadow-sm">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition"
              title="Toggle Sidebar"
            >
              <Menu size={22} />
            </button>

            <div className="flex w-96 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 transition focus-within:border-[#044C34] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#044C34]/10">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything..."
                className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
              <Search size={18} className="text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 select-none">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Updates</span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
                title="View Notifications"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#044C34] text-[10px] font-black text-white ring-2 ring-white">
                  12
                </span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <h4 className="text-xs font-black uppercase text-slate-800">Pending Actions (12)</h4>
                    <button onClick={() => setNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={15} />
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/60">
                      <p className="font-bold text-amber-900">📦 8 Food Orders Awaiting Kitchen</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">Please accept or dispatch orders in Orders tab.</p>
                    </div>
                    <div className="rounded-xl bg-sky-50 p-3 border border-sky-200/60">
                      <p className="font-bold text-sky-900">🚕 4 Driver Dispatch Alerts</p>
                      <p className="text-[11px] text-sky-700 mt-0.5">Fleet drivers awaiting route confirmation.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#044C34] font-black text-white shadow-sm">
                A
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold leading-tight text-slate-900">Super Admin</p>
                <p className="text-[11px] font-semibold text-slate-400">Administrator</p>
              </div>
              <ChevronDown size={16} className="text-slate-400" />
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition shadow-sm ml-2"
              title="Logout to Admin Login Screen"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {dataFetchError && (
          <div className="mx-8 mt-6 rounded-2xl bg-red-50 p-4 border border-red-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-red-900">Connection Error</p>
                <p className="text-xs text-red-700 font-medium">{dataFetchError}</p>
              </div>
            </div>
            <button
              onClick={handleRetryFetch}
              disabled={isDataLoading}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {isDataLoading ? 'Reconnecting...' : 'Retry Connection'}
            </button>
          </div>
        )}

        {activeTab === 'overview' && (
          <>
            <section className="p-8 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {statCards.map((card) => {
              const IconComponent = card.icon
              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex items-center gap-4"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.color} shadow-sm`}>
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">{card.title}</p>
                    <p className="text-2xl font-black tracking-tight text-slate-900 mt-0.5">{card.value}</p>
                    <p className="text-[11px] font-bold text-emerald-600 mt-1">{card.trend}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="px-8 py-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 2xl:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Revenue Overview</h3>
                  <p className="text-xs font-semibold text-slate-400">Garowe & Puntland Daily Performance</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100">
                  <span>Last 7 Days</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              <RevenueOverviewChart />
            </div>

            <div className="xl:col-span-2 2xl:col-span-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900">Orders Overview</h3>
                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    <span>Last 7 Days</span>
                    <ChevronDown size={12} />
                  </div>
                </div>
                <OrdersOverviewDonut totalCount={foodOrders.length + liveRides.length} foodCount={foodOrders.length} taxiCount={liveRides.length} />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900">Live Activity</h3>
                  <button type="button" className="text-xs font-bold text-[#044C34] hover:underline">
                    View All
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  {initialActivity.map((act) => (
                    <div key={act.id} className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#044C34]">
                          {act.iconType === 'order' && <UtensilsCrossed size={15} />}
                          {act.iconType === 'ride' && <Car size={15} className="text-[#F5A623]" />}
                          {act.iconType === 'progress' && <Clock size={15} className="text-blue-500" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{act.title}</p>
                          <p className="text-[11px] text-slate-500">{act.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">{act.time} •</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 py-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Recent Orders</h3>
                  <p className="text-xs font-medium text-slate-400">Live kitchen & delivery dispatches</p>
                </div>
                <button type="button" className="text-xs font-bold text-[#044C34] hover:underline">
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-3 py-3">Order ID</th>
                      <th className="px-3 py-3">Customer</th>
                      <th className="px-3 py-3">Restaurant</th>
                      <th className="px-3 py-3">Amount</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {(filteredOrders || [])?.map((order) => {
                      const isPreparing = order.status === 'Preparing'
                      const isOnWay = order.status === 'On the Way'
                      return (
                        <tr
                          key={order.id}
                          className="transition hover:bg-slate-50/70 cursor-pointer"
                          onClick={() => cycleRecentOrder(order.id)}
                          title="Click to cycle status"
                        >
                          <td className="px-3 py-3.5 font-bold text-slate-900">{order.id}</td>
                          <td className="px-3 py-3.5 text-slate-700">{order.customer}</td>
                          <td className="px-3 py-3.5 text-slate-700">{order.restaurant}</td>
                          <td className="px-3 py-3.5 font-bold text-slate-900">{order.amount}</td>
                          <td className="px-3 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                isPreparing
                                  ? 'bg-amber-100 text-amber-800'
                                  : isOnWay
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-right font-semibold text-slate-400">{order.time}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Live Taxi Rides</h3>
                  <p className="text-xs font-medium text-slate-400">Puntland driver routes & dispatches</p>
                </div>
                <button type="button" className="text-xs font-bold text-[#044C34] hover:underline">
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-3 py-3">Ride ID</th>
                      <th className="px-3 py-3">Passenger</th>
                      <th className="px-3 py-3">From → To</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {(filteredRides || [])?.map((ride) => {
                      const isOnWay = ride.status === 'On the Way'
                      const isArrived = ride.status === 'Arrived'
                      return (
                        <tr
                          key={ride.id}
                          className="transition hover:bg-slate-50/70 cursor-pointer"
                          onClick={() => cycleTaxiRide(ride.id)}
                          title="Click to cycle status"
                        >
                          <td className="px-3 py-3.5 font-bold text-slate-900">{ride.id}</td>
                          <td className="px-3 py-3.5 text-slate-700">{ride.passenger}</td>
                          <td className="px-3 py-3.5 font-semibold text-slate-800">{ride.route}</td>
                          <td className="px-3 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                isOnWay
                                  ? 'bg-sky-100 text-sky-800'
                                  : isArrived
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {ride.status}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-right font-semibold text-slate-400">{ride.time}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="px-8 pb-8 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h4 className="text-sm font-black text-slate-900">Top Restaurants</h4>
                <button type="button" className="text-xs font-bold text-[#044C34] hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {derivedTopRestaurants.map((res) => (
                  <div key={res.name} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-base overflow-hidden shrink-0 border border-amber-100">
                        {(() => {
                          const logoStr = res.emoji || (res as any).logoImage || (res as any).logo_image || '🏪';
                          return logoStr.startsWith('http://') || logoStr.startsWith('https://') || logoStr.startsWith('data:image/') ? (
                            <img src={logoStr} alt={res.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <span>{logoStr}</span>
                          );
                        })()}
                      </span>
                      <span className="text-slate-800 truncate">{res.name}</span>
                    </div>
                    <span className="text-slate-500 font-semibold">{res.orders}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h4 className="text-sm font-black text-slate-900">Top Categories</h4>
                <button type="button" className="text-xs font-bold text-[#044C34] hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {derivedTopCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-base">
                        {cat.emoji}
                      </span>
                      <span className="text-slate-800">{cat.name}</span>
                    </div>
                    <span className="text-slate-500 font-semibold">{cat.orders}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h4 className="text-sm font-black text-slate-900">Payment Summary</h4>
                <button type="button" className="text-xs font-bold text-[#044C34] hover:underline">View All</button>
              </div>
              <div className="space-y-2.5">
                {derivedPaymentSummary.map((pay) => (
                  <div key={pay.provider} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black ${pay.color}`}>
                        {pay.code}
                      </span>
                      <span className="text-slate-800">{pay.provider}</span>
                    </div>
                    <span className="text-slate-900 font-black">{pay.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h4 className="text-sm font-black text-slate-900">System Status</h4>
                <button type="button" className="text-xs font-bold text-[#044C34] hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {derivedSystemStatus.map((sys) => (
                  <div key={sys.service} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{sys.service}</p>
                      <p className="text-[11px] font-semibold text-emerald-600">{sys.status}</p>
                    </div>
                    <CheckCircle2 size={16} className="text-[#16A34A] shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Food Menu Table Section */}
        <section className="px-8 pb-8">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900">Food Menu Management</h3>
                <p className="text-xs font-medium text-slate-500">
                  {(() => {
                    const activeCategory = typeof menuCategoryFilter !== 'undefined' ? menuCategoryFilter : 'All';
                    return `Showing ${(activeCategory === 'All' ? filteredMenu : filteredMenu.filter(i => {
                      const itemClean = (i.category || "").replace(/^[\u2000-\u3300\uD83C-\uDBFF\uDC00-\uDFFF\s]+/g, "").trim().toLowerCase();
                      const filterClean = activeCategory.replace(/^[\u2000-\u3300\uD83C-\uDBFF\uDC00-\uDFFF\s]+/g, "").trim().toLowerCase();
                      return itemClean === filterClean || itemClean.includes(filterClean) || filterClean.includes(itemClean);
                    })).length} dishes active across Garowe restaurants`;
                  })()}
                </p>
              </div>
              <button
                type="button"
                onClick={openFoodModal}
                className="flex items-center gap-2 rounded-xl bg-[#044C34] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#033b28]"
              >
                <Plus size={16} />
                <span>Add Menu Item</span>
              </button>
            </div>

            {/* ── Category Filter Pills ── */}
            <div className="mb-4 flex flex-wrap gap-2">
              {['All', ...FOOD_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMenuCategoryFilter(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition border ${
                    menuCategoryFilter === cat
                      ? 'bg-[#044C34] text-white border-[#044C34] shadow-md'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'All' ? '🍽️ All' : cat}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Dish Name</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(menuCategoryFilter === 'All' ? filteredMenu : filteredMenu.filter(i => {
                    const itemClean = (i.category || "").replace(/^[\u2000-\u3300\uD83C-\uDBFF\uDC00-\uDFFF\s]+/g, "").trim().toLowerCase();
                    const filterClean = menuCategoryFilter.replace(/^[\u2000-\u3300\uD83C-\uDBFF\uDC00-\uDFFF\s]+/g, "").trim().toLowerCase();
                    return itemClean === filterClean || itemClean.includes(filterClean) || filterClean.includes(itemClean);
                  })).map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-bold text-slate-900">{item.name}</td>
                      <td className="px-5 py-4 font-medium text-slate-600">{item.category}</td>
                      <td className="px-5 py-4 font-bold text-[#044C34]">{item.price}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
                          {item.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
          </>
        )}

        {activeTab === 'orders' && (
          <div className="p-8 space-y-6">
            {/* 1. PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-slate-200/80 shadow-sm">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#044C34] text-white shadow-md">
                    <Package size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Orders & Restaurants Management</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      Live order tracking and partner restaurant inventory in Garowe.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={openAddRestaurantModal}
                  className="flex items-center gap-2 rounded-xl border border-[#044C34] bg-emerald-50 px-4.5 py-2.5 text-xs font-extrabold text-[#044C34] hover:bg-emerald-100 transition shadow-sm"
                >
                  <Plus size={16} />
                  <span>Add New Restaurant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setManualOrderModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#044C34] px-4.5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#044C34]/25 hover:bg-[#033b28] transition"
                >
                  <Plus size={16} />
                  <span>Create Manual Order</span>
                </button>
              </div>
            </div>

            {/* 2. DUAL-VIEW SUB-TABS */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-200/70 p-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setOrdersSubTab('food_orders')}
                  className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all duration-200 ${
                    ordersSubTab === 'food_orders'
                      ? 'bg-[#044C34] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Package size={16} className={ordersSubTab === 'food_orders' ? 'text-[#F5A623]' : 'text-slate-400'} />
                  <span>Food Orders ({foodOrders.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersSubTab('restaurants')}
                  className={`flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all duration-200 ${
                    ordersSubTab === 'restaurants'
                      ? 'bg-[#044C34] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Store size={16} className={ordersSubTab === 'restaurants' ? 'text-[#F5A623]' : 'text-slate-400'} />
                  <span>Partner Restaurants ({partnerRestaurants.length})</span>
                </button>
              </div>

              {ordersSubTab === 'food_orders' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <div className="flex items-center gap-1.5 px-2 text-xs font-extrabold text-slate-500">
                    <Filter size={15} className="text-[#044C34]" />
                    <span>Filter:</span>
                  </div>
                  {['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((pill) => {
                    const isActive = orderFilter === pill
                    const count = pill === 'All' ? foodOrders.length : foodOrders.filter(o => o.status === pill).length
                    return (
                      <button
                        key={pill}
                        type="button"
                        onClick={() => setOrderFilter(pill)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-[#138C48] text-white shadow-sm'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{pill}</span>
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 3. FOOD ORDERS VIEW CONTENT */}
            {ordersSubTab === 'food_orders' && (
              <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm overflow-hidden">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Garowe Live Food Orders</h3>
                    <p className="text-xs font-medium text-slate-400">Click any status pill to cycle order stage • Showing {filteredFoodOrdersList.length} orders</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Auto-Assign Rider</span>
                      <button 
                        onClick={() => setAutoAssignEnabled(!autoAssignEnabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoAssignEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoAssignEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Dispatch Active
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3.5">Order ID</th>
                        <th className="px-4 py-3.5">Customer Name</th>
                        <th className="px-4 py-3.5">Restaurant</th>
                        <th className="px-4 py-3.5 min-w-[200px]">Items Ordered</th>
                        <th className="px-4 py-3.5 min-w-[180px]">Delivery Address</th>
                        <th className="px-4 py-3.5">Total Price</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredFoodOrdersList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                            {foodOrders.length === 0 ? "No orders found in database." : "No orders matching your filter criteria."}
                          </td>
                        </tr>
                      ) : (
                        (filteredFoodOrdersList || [])?.map((order) => {
                          const statusColors = {
                            Pending: 'bg-amber-100 text-amber-800 border-amber-200/60',
                            'Out for Delivery': 'bg-sky-100 text-sky-800 border-sky-200/60',
                            Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200/60',
                            Cancelled: 'bg-rose-100 text-rose-800 border-rose-200/60',
                          }
                          return (
                            <tr key={order.id} className="transition hover:bg-slate-50/70">
                              <td className="px-4 py-4 font-black text-slate-900">
                                {order.id}
                                <span className="block text-[10px] font-normal text-slate-400 mt-0.5">{order.time}</span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="font-bold text-slate-900">{order.customerName}</div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Phone size={11} /> {order.phone}
                                </div>
                              </td>
                              <td className="px-4 py-4 font-bold text-[#044C34]">
                                {order.restaurant}
                              </td>
                              <td className="px-4 py-4 text-slate-700 leading-relaxed font-semibold">
                                {safeRenderItems(order.rawItems && order.rawItems.length > 0 ? order.rawItems : order.items)}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                <div className="flex items-start gap-1.5">
                                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                  <span>{order.address}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 font-black text-slate-900 text-sm">
                                {order.total}
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}
                                >
                                  <span>{order.status}</span>
                                </span>
                                {order.driver && (
                                  <div className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                                    <Truck size={11} className="text-[#044C34]" /> {order.driver}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOrderDetails(order)}
                                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-[#044C34] transition flex items-center gap-1 shrink-0"
                                    title="View Details"
                                  >
                                    <Eye size={13} />
                                    <span>Details</span>
                                  </button>

                                  <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as FoodOrder['status'])}
                                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold shadow-sm outline-none shrink-0 ${
                                      order.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                      order.status === 'Preparing' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                      order.status === 'Out for Delivery' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                      'bg-rose-50 text-rose-800 border-rose-200'
                                    }`}
                                  >
                                    <option value="Pending">Pending / Order Placed</option>
                                    <option value="Preparing">Preparing</option>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>

                                  {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                                    (order.driverName || order.driver) ? (
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1.5 text-xs font-extrabold text-white shadow-sm shrink-0 whitespace-nowrap">
                                        🟢 {order.driverName || order.driver}
                                      </span>
                                    ) : (
                                      <select
                                        value=""
                                        onChange={(e) => {
                                          const dr = drivers.find(d => d.full_name === e.target.value);
                                          if (dr) handleAssignDriver(order.id, { id: dr.id, name: dr.full_name, phone: dr.phone });
                                        }}
                                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm outline-none focus:border-[#044C34] max-w-[140px]"
                                      >
                                        <option value="" disabled>Assign Rider...</option>
                                        {drivers.map(driver => (
                                          <option key={driver.id} value={driver.full_name}>
                                            {driver.is_online ? '🟢' : '🔴'} {driver.full_name}
                                          </option>
                                        ))}
                                      </select>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {hasMoreOrders && filteredFoodOrdersList.length > 0 && orderFilter === 'All' && !searchQuery && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setOrderPage(p => p + 1)}
                      className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      Load Older Orders
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. RESTAURANTS VIEW CONTENT */}
            {ordersSubTab === 'restaurants' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Partner Restaurants ({filteredPartnerRestaurantsList.length})
                    </h3>
                    <p className="text-xs font-medium text-slate-400">
                      Showing all verified food delivery partners across Garowe districts
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(filteredPartnerRestaurantsList || [])?.map((res) => {
                    const isActive = res.status === 'Active'
                    return (
                      <div
                        key={res.id}
                        className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl border border-emerald-100 shadow-inner overflow-hidden shrink-0">
                                {(() => {
                                  const logoStr = res.logoImage || res.emoji || (res as any).logo_image || (res as any).logo || '🏪';
                                  return logoStr.startsWith('http://') || logoStr.startsWith('https://') || logoStr.startsWith('data:image/') ? (
                                    <img src={logoStr} alt={res.name} className="w-14 h-14 rounded-2xl object-cover" />
                                  ) : (
                                    <span className="text-2xl">{logoStr}</span>
                                  );
                                })()}
                              </span>
                              <div>
                                <h4 className="text-base font-black text-slate-900 tracking-tight">{res.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-extrabold text-amber-700 border border-amber-200/60">
                                    <Star size={11} className="fill-amber-400 text-amber-500" />
                                    {res.rating}
                                  </span>
                                  <span className="text-xs font-bold text-slate-500">• {res.ordersCount}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleRestaurantStatus(res.id)}
                              title="Click to toggle status Active/Inactive"
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold border transition ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {res.status}
                            </button>
                          </div>

                          <div className="mt-5 space-y-2.5 rounded-2xl bg-slate-50/80 p-3.5 text-xs font-medium text-slate-600 border border-slate-100">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-[#044C34] shrink-0" />
                              <span className="truncate">{res.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-[#044C34] shrink-0" />
                              <span>{res.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-[#F5A623] shrink-0" />
                              <span>Est. Prep & Delivery: <strong className="text-slate-800">{res.deliveryTime}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleRestaurantStatus(res.id)}
                              className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                            >
                              Toggle {isActive ? 'Pause' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditRestaurant(res)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 transition"
                              title="Edit Restaurant"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRestaurantToDelete(res)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Delete Restaurant"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRestaurantForMenu(res);
                              fetchRestaurantDishes(res.id);
                            }}
                            className="flex items-center gap-1.5 rounded-xl bg-[#044C34] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#044C34]/20 hover:bg-[#033b28] transition"
                          >
                            <FileText size={14} />
                            <span>Manage Menu</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2.5: RIDERS MANAGEMENT ─── */}
        {activeTab === 'riders' && (
          <div className="flex-1 space-y-6 overflow-y-auto p-6 md:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-emerald-100 p-1.5 text-[#044C34]">
                    <Truck size={18} />
                  </span>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Riders & Fleet</h2>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-500">Manage drivers, dispatch, and tracking.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDriverModalOpen(true)}
                  className="rounded-xl bg-[#044C34] px-5 py-2.5 text-sm font-black text-white shadow-md shadow-[#044C34]/20 hover:bg-[#033b28] hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add New Rider
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Riders</p>
                  <p className="text-2xl font-black text-slate-900">{drivers.length}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Online Now</p>
                  <p className="text-2xl font-black text-slate-900">{drivers.filter(d => d.is_online).length}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Total Deliveries</p>
                  <p className="text-2xl font-black text-slate-900">{drivers.reduce((acc, d) => acc + (d.total_orders_delivered || 0), 0)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm overflow-hidden">
              <h3 className="mb-4 text-base font-black text-slate-900">Fleet Roster</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3.5">Name</th>
                      <th className="px-4 py-3.5">Phone</th>
                      <th className="px-4 py-3.5">PIN Code</th>
                      <th className="px-4 py-3.5">Vehicle</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Deliveries</th>
                      <th className="px-4 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {drivers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                          No drivers registered yet. Add one above.
                        </td>
                      </tr>
                    ) : (
                      drivers.map((driver) => (
                        <tr key={driver.id} className="transition hover:bg-slate-50/70">
                          <td className="px-4 py-4 font-black text-slate-900">{driver.full_name}</td>
                          <td className="px-4 py-4 text-slate-600">{driver.phone}</td>
                          <td className="px-4 py-4 font-mono text-slate-600">{driver.pin_code}</td>
                          <td className="px-4 py-4 text-slate-600">{driver.vehicle_type}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${driver.is_online ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${driver.is_online ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {driver.is_online ? 'Online' : 'Offline'}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-bold text-slate-700">{driver.total_orders_delivered || 0}</td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleDriverStatus(driver.id, driver.is_online)}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                              >
                                Toggle Status
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDriver(driver.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                title="Delete Driver"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: TAXI RIDES MANAGEMENT ─── */}
        {activeTab === 'taxi' && (
          <div className="flex-1 space-y-6 overflow-y-auto p-6 md:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-emerald-100 p-1.5 text-[#044C34]">
                    <Car size={18} />
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#16A34A]">Garowe Taxi Dispatch</span>
                </div>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Live Taxi Rides Fleet</h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">Real-time GPS tracking and ride assignments across Puntland routes.</p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 shadow-sm">
                  <Search size={14} className="text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ride, passenger, route..."
                    className="w-36 bg-transparent text-xs font-medium outline-none sm:w-48 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats Banner for Taxi Rides */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Rides Today</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{liveRides.length}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12% vs yesterday</span>
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Taxi Fleet</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#044C34]">42 Drivers</span>
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">On Standby</span>
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Route Fare</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">$18.40</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">EVC Plus / Cash</span>
                </div>
              </div>
            </div>

            {/* Taxi Rides Table */}
            <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-sm overflow-hidden">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Garowe Live Taxi Rides Table</h3>
                  <p className="text-xs font-medium text-slate-400">Click any action to cycle route stage or assign driver</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  GPS Live Feed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3.5">Ride ID</th>
                      <th className="px-4 py-3.5">Passenger</th>
                      <th className="px-4 py-3.5">Assigned Driver</th>
                      <th className="px-4 py-3.5">Route Description</th>
                      <th className="px-4 py-3.5">Est. Fare</th>
                      <th className="px-4 py-3.5">Current Status</th>
                      <th className="px-4 py-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRides.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                          No taxi rides found matching "{searchQuery}"
                        </td>
                      </tr>
                    ) : (
                      (filteredRides || [])?.map((ride) => {
                        const isCompleted = ride.status === 'Completed'
                        const isArrived = ride.status === 'Arrived'
                        return (
                          <tr key={ride.id} className="transition hover:bg-slate-50/70">
                            <td className="px-4 py-4 font-black text-slate-900">
                              {ride.id}
                              <span className="block text-[10px] font-normal text-slate-400 mt-0.5">{ride.time}</span>
                            </td>
                            <td className="px-4 py-4 font-bold text-slate-900">
                              {ride.passenger}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1.5 font-bold text-[#044C34]">
                                <Truck size={13} />
                                <span>{ride.driver}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 font-semibold text-slate-700">
                              <div className="flex items-center gap-1.5">
                                <MapPin size={13} className="text-slate-400 shrink-0" />
                                <span>{ride.route}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 font-black text-slate-900">
                              {ride.fare}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                                ride.status === 'On the Way'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : ride.status === 'Arrived'
                                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              }`}>
                                <span>{ride.status}</span>
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => cycleTaxiRide(ride.id)}
                                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                                  isCompleted
                                    ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                    : isArrived
                                    ? 'bg-[#044C34] text-white hover:bg-[#033b28]'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {isCompleted ? 'Reset Trip' : isArrived ? 'Mark Completed' : 'Notify Arrived'}
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <PushNotificationsTab />
        )}

        {activeTab === 'settings' && (
          <div className="p-8 space-y-6 max-w-5xl">
            <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">System & Store Settings</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1">Configure active operating parameters, delivery zones, and currency defaults across Garowe.</p>
                </div>
                {settingsSavedMessage && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Settings Saved Successfully!
                  </span>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSettingsSavedMessage(true)
                  setTimeout(() => setSettingsSavedMessage(false), 3500)
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">🕒 Store Operating Hours</label>
                    <input
                      type="text"
                      value={storeSettings.operatingHours}
                      onChange={(e) => setStoreSettings({ ...storeSettings, operatingHours: e.target.value })}
                      placeholder="e.g. 08:00 AM - 11:30 PM"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#044C34] focus:bg-white focus:ring-2 focus:ring-[#044C34]/10 transition"
                    />
                    <p className="text-[11px] font-medium text-slate-400">Controls ordering availability on the mobile app</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">📍 Delivery Radius in Garowe (km)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={storeSettings.deliveryRadiusKm}
                        onChange={(e) => setStoreSettings({ ...storeSettings, deliveryRadiusKm: e.target.value })}
                        placeholder="e.g. 8"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#044C34] focus:bg-white focus:ring-2 focus:ring-[#044C34]/10 transition"
                      />
                      <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">km</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400">Maximum dispatch distance from central kitchen</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">💵 Minimum Order Amount ($)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-sm font-bold text-slate-400">$</span>
                      <input
                        type="text"
                        value={storeSettings.minOrderAmount}
                        onChange={(e) => setStoreSettings({ ...storeSettings, minOrderAmount: e.target.value })}
                        placeholder="e.g. 5.00"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#044C34] focus:bg-white focus:ring-2 focus:ring-[#044C34]/10 transition"
                      />
                    </div>
                    <p className="text-[11px] font-medium text-slate-400">Minimum subtotal required to place checkout order</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">💱 System Currency</label>
                    <select
                      value={storeSettings.currency}
                      onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#044C34] focus:bg-white focus:ring-2 focus:ring-[#044C34]/10 transition"
                    >
                      <option value="$ USD">$ USD - US Dollar</option>
                      <option value="SOS - Somali Shilling">SOS - Somali Shilling</option>
                    </select>
                    <p className="text-[11px] font-medium text-slate-400">Primary display currency across admin and mobile app</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">Operational System Toggles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 cursor-pointer hover:bg-slate-50 transition">
                      <div className="pr-3">
                        <p className="text-xs font-extrabold text-slate-900">Auto-Accept Orders</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">Automatically move new incoming orders to Preparing</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={storeSettings.autoAcceptOrders}
                        onChange={(e) => setStoreSettings({ ...storeSettings, autoAcceptOrders: e.target.checked })}
                        className="h-5 w-5 rounded border-slate-300 text-[#044C34] focus:ring-[#044C34]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 cursor-pointer hover:bg-slate-50 transition">
                      <div className="pr-3">
                        <p className="text-xs font-extrabold text-slate-900">Sound Notifications</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">Play audio alert on new order or taxi dispatch</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={storeSettings.soundNotifications}
                        onChange={(e) => setStoreSettings({ ...storeSettings, soundNotifications: e.target.checked })}
                        className="h-5 w-5 rounded border-slate-300 text-[#044C34] focus:ring-[#044C34]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 cursor-pointer hover:bg-slate-50 transition">
                      <div className="pr-3">
                        <p className="text-xs font-extrabold text-slate-900">SMS Gateway Alerts</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">Send EVC/Zaad verification SMS to customers</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={storeSettings.smsAlerts}
                        onChange={(e) => setStoreSettings({ ...storeSettings, smsAlerts: e.target.checked })}
                        className="h-5 w-5 rounded border-slate-300 text-[#044C34] focus:ring-[#044C34]"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#044C34] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#033b28] transition flex items-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    <span>Save System Settings</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <footer className="mt-auto border-t border-slate-200/80 bg-white px-8 py-5 text-center text-xs font-bold text-slate-400 flex flex-col sm:flex-row items-center justify-between">
          <span>© 2026 PuntGo Admin Dashboard. All rights reserved.</span>
          <span className="mt-1 sm:mt-0 font-mono text-emerald-700">v1.0.0</span>
        </footer>
      </div>

      {/* Quick Action Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-100 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">Punt Eats Quick Action</p>
                <h3 className="text-xl font-black text-slate-900">{editingDishId !== null ? `Edit Food Item` : `Add New Food Item`}</h3>
              </div>
              <button
                type="button"
                onClick={() => { setModalOpen(false); setEditingDishId(null); }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">🍲 Dish Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34] focus:ring-2 focus:ring-[#044C34]/10"
                  placeholder="e.g. Pepperoni Cheese Pizza"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">📂 Category (11 App Categories)</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34] focus:ring-2 focus:ring-[#044C34]/10"
                  >
                    {dbCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">💵 Price ($)</label>
                  <input
                    value={(form.variants && form.variants.length > 0) ? Math.min(...form.variants.map((v: any) => Number(v.price) || 0)).toString() : form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    readOnly={form.variants && form.variants.length > 0}
                    className={`w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34] focus:ring-2 focus:ring-[#044C34]/10 ${(form.variants && form.variants.length > 0) ? 'bg-slate-50' : ''}`}
                    placeholder="e.g. 12.99"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">⏱️ Prep/Delivery Time</label>
                  <input
                    value={form.prepTime}
                    onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                    placeholder="e.g. 20 mins"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">🔥 Calories</label>
                  <input
                    value={form.calories}
                    onChange={(e) => setForm({ ...form, calories: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                    placeholder="e.g. 300 kcal"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">📦 Availability</label>
                  <select
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">⭐ Rating</label>
                  <input
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                    placeholder="e.g. 4.8 ★"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-600">🖼️ Image Selection (1 to 3 Images via Supabase Storage)</label>
                  {uploadingImage && <span className="text-[11px] font-bold text-blue-600 animate-pulse">⏳ Uploading to Supabase Storage...</span>}
                </div>
                <div className="space-y-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
                  {/* Slot 1 */}
                  <div>
                    <span className="block text-[11px] font-extrabold text-slate-700 mb-1">Primary Image 1 (Main Hero) *</span>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <label className="cursor-pointer rounded-xl border border-dashed border-[#044C34]/40 bg-white px-3 py-2 text-xs font-bold text-[#044C34] hover:bg-emerald-50 transition flex items-center justify-center gap-1.5 shrink-0">
                        <span>📁 Upload Photo 1</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'quick')} className="hidden" />
                      </label>
                      <input
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                        placeholder="Storage URL or direct Photo URL"
                      />
                    </div>
                    {form.imageUrl && <img src={form.imageUrl} alt="Slot 1" className="mt-1.5 w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-sm" />}
                  </div>

                  {/* Slot 2 */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="block text-[11px] font-extrabold text-slate-700 mb-1">Image 2 (Optional - Angle View)</span>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <label className="cursor-pointer rounded-xl border border-dashed border-[#044C34]/40 bg-white px-3 py-2 text-xs font-bold text-[#044C34] hover:bg-emerald-50 transition flex items-center justify-center gap-1.5 shrink-0">
                        <span>📁 Upload Photo 2</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'quick2')} className="hidden" />
                      </label>
                      <input
                        value={form.imageUrl2 || ''}
                        onChange={(e) => setForm({ ...form, imageUrl2: e.target.value })}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                        placeholder="Storage URL or direct Photo URL"
                      />
                    </div>
                    {form.imageUrl2 && <img src={form.imageUrl2} alt="Slot 2" className="mt-1.5 w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-sm" />}
                  </div>

                  {/* Slot 3 */}
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="block text-[11px] font-extrabold text-slate-700 mb-1">Image 3 (Optional - Close Up Detail)</span>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <label className="cursor-pointer rounded-xl border border-dashed border-[#044C34]/40 bg-white px-3 py-2 text-xs font-bold text-[#044C34] hover:bg-emerald-50 transition flex items-center justify-center gap-1.5 shrink-0">
                        <span>📁 Upload Photo 3</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'quick3')} className="hidden" />
                      </label>
                      <input
                        value={form.imageUrl3 || ''}
                        onChange={(e) => setForm({ ...form, imageUrl3: e.target.value })}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                        placeholder="Storage URL or direct Photo URL"
                      />
                    </div>
                    {form.imageUrl3 && <img src={form.imageUrl3} alt="Slot 3" className="mt-1.5 w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-sm" />}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">📝 Description (Product Details for Mobile App)</label>
                    <label className="mb-1.5 block text-xs font-bold text-slate-600">📝 Description (Product Details for Mobile App)</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium outline-none focus:border-[#044C34]"
                  placeholder="A classic favorite! Indulge in a crispy, thin crust topped with rich tomato sauce..."
                />
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-600">➕ Add-Ons / Included Extras</label>
                  <button type="button" onClick={addFormAddOn} disabled={(form?.add_ons || []).length >= 10} className="text-[10px] font-bold text-[#044C34] hover:underline disabled:opacity-50">
                    + Add Extra Item
                  </button>
                </div>
                <div className="space-y-3">
                  {(form?.add_ons || []).map(addon => (
                    <div key={addon.id} className="flex gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input type="text" value={addon.name} onChange={e => updateFormAddOn(addon.id, 'name', e.target.value)} placeholder="e.g. Extra Sauce" className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] outline-none focus:border-[#044C34]" />
                          <input type="text" value={addon.price} onChange={e => updateFormAddOn(addon.id, 'price', e.target.value)} placeholder="Price ($0.00)" className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] outline-none focus:border-[#044C34]" />
                        </div>
                        <input type="text" value={addon.description} onChange={e => updateFormAddOn(addon.id, 'description', e.target.value)} placeholder="Description (Optional)" className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] outline-none focus:border-[#044C34]" />
                      </div>
                      <button type="button" onClick={() => removeFormAddOn(addon.id)} className="p-2 h-fit rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-600">🎛️ Product Variants / Options</label>
                  <button type="button" onClick={addFormVariant} className="text-[10px] font-bold text-[#044C34] hover:underline">
                    + Add Variant Option
                  </button>
                </div>
                <div className="space-y-3">
                  {(form?.variants || []).map(variant => (
                    <div key={variant.id} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <input type="radio" checked={variant.is_default} onChange={() => setFormVariantDefault(variant.id)} name="formVariantDefault" className="w-4 h-4 accent-[#044C34]" />
                      <input type="text" value={variant.option_name} onChange={e => updateFormVariant(variant.id, 'option_name', e.target.value)} placeholder="e.g. Boneless" className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] outline-none focus:border-[#044C34]" />
                      <input type="text" value={variant.price} onChange={e => updateFormVariant(variant.id, 'price', e.target.value)} placeholder="Price ($)" className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] outline-none focus:border-[#044C34]" />
                      <button type="button" onClick={() => removeFormVariant(variant.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setEditingDishId(null); }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#044C34] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#044C34]/20 hover:bg-[#033b28]"
                >
                  Save Menu Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Restaurant Modal */}
      {restaurantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-100 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">PuntGo Partner Setup</p>
                <h3 className="text-xl font-black text-slate-900">{editingRestaurantId ? 'Edit Restaurant' : 'Add New Restaurant'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setRestaurantModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddRestaurantSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Restaurant Name</label>
                <input
                  required
                  value={newRestaurantForm.name}
                  onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34] focus:ring-2 focus:ring-[#044C34]/10"
                  placeholder="e.g. Gasin Bistro"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Phone Number</label>
                  <input
                    value={newRestaurantForm.phone}
                    onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                    placeholder="907730148"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Delivery Fee</label>
                  <input
                    value={newRestaurantForm.deliveryFee}
                    onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, deliveryFee: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                    placeholder="$2.00"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Min Order</label>
                  <input
                    value={newRestaurantForm.minOrder}
                    onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, minOrder: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                    placeholder="$5.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Category Focus</label>
                  <input
                    value={newRestaurantForm.categoryFocus}
                    onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, categoryFocus: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                    placeholder="e.g. Somali Traditional & Fast Food"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Prep / Delivery Time</label>
                  <input
                    value={newRestaurantForm.deliveryTime}
                    onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, deliveryTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                    placeholder="e.g. 20-30m"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Garowe Address</label>
                <input
                  value={newRestaurantForm.address}
                  onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                  placeholder="e.g. Wadajir Road, Near Main Market"
                />
              </div>
              <div className="space-y-2">
                {uploadingImage && (
                  <div className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 animate-pulse flex items-center gap-2">
                    <span>⏳ Uploading file to Supabase Storage (restaurant-images bucket)...</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-600">Logo Emoji / Badge (Storage URL or Emoji)</label>
                    <input
                      value={newRestaurantForm.logoImage}
                      onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, logoImage: e.target.value, emoji: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium outline-none focus:border-[#044C34] truncate"
                      placeholder="e.g. 🏪 or Storage URL"
                    />
                    {newRestaurantForm.logoImage && (newRestaurantForm.logoImage.startsWith('http://') || newRestaurantForm.logoImage.startsWith('https://') || newRestaurantForm.logoImage.startsWith('data:image/')) && (
                      <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 p-1.5 max-w-full overflow-hidden">
                        <img src={newRestaurantForm.logoImage} alt="Logo preview" className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm" />
                        <span className="text-[10px] text-slate-500 font-medium truncate flex-1">{newRestaurantForm.logoImage}</span>
                      </div>
                    )}
                    <label className="mt-1 block text-[10px] text-slate-400">Or upload logo file:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'restaurant_logo')}
                      className="mt-0.5 block w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-[10px] file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-600">Cover Banner (Mobile App Card)</label>
                    <input
                      value={newRestaurantForm.coverImage}
                      onChange={(e) => setNewRestaurantForm({ ...newRestaurantForm, coverImage: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium outline-none focus:border-[#044C34] truncate"
                      placeholder="Supabase Storage URL or direct Photo URL"
                    />
                    {newRestaurantForm.coverImage && (newRestaurantForm.coverImage.startsWith('http://') || newRestaurantForm.coverImage.startsWith('https://') || newRestaurantForm.coverImage.startsWith('data:image/')) && (
                      <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 p-1.5 max-w-full overflow-hidden">
                        <img src={newRestaurantForm.coverImage} alt="Banner preview" className="w-6 h-6 rounded object-cover shrink-0 border border-slate-200 shadow-sm" />
                        <span className="text-[10px] text-slate-500 font-medium truncate flex-1">{newRestaurantForm.coverImage}</span>
                      </div>
                    )}
                    <label className="mt-1 block text-[10px] text-slate-400">Or upload banner file:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'restaurant_cover')}
                      className="mt-0.5 block w-full text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-[10px] file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                    />
                  </div>
                </div>
              </div>
              {newRestaurantForm.coverImage && (
                <div className="relative h-28 w-full overflow-hidden rounded-2xl border border-slate-200">
                  <img src={newRestaurantForm.coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                    <div className="text-xs font-bold text-white flex items-center gap-2 max-w-full overflow-hidden">
                      {(() => {
                        const logoStr = newRestaurantForm.logoImage || newRestaurantForm.emoji || '🏪';
                        return logoStr.startsWith('http://') || logoStr.startsWith('https://') || logoStr.startsWith('data:image/') ? (
                          <img src={logoStr} alt="Logo" className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/60 shadow-sm" />
                        ) : (
                          <span className="text-base shrink-0">{logoStr}</span>
                        );
                      })()}
                      <span className="truncate">{newRestaurantForm.name || 'Restaurant Preview'}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestaurantModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#044C34] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#044C34]/20 hover:bg-[#033b28]"
                >
                  {editingRestaurantId ? 'Update Restaurant' : 'Save Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Restaurant Confirmation Modal */}
      {restaurantToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[24px] border border-slate-100 bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Delete Restaurant?</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">
              Are you sure you want to completely remove <strong>{restaurantToDelete.name}</strong> from PuntGo? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setRestaurantToDelete(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteRestaurant}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Order Modal */}
      {manualOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">PuntGo Dispatch</p>
                <h3 className="text-xl font-black text-slate-900">Create Manual Order</h3>
              </div>
              <button
                type="button"
                onClick={() => setManualOrderModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleManualOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Customer Name</label>
                  <input
                    required
                    value={manualOrderForm.customerName}
                    onChange={(e) => setManualOrderForm({ ...manualOrderForm, customerName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                    placeholder="e.g. Ahmed Ali"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Phone Number</label>
                  <input
                    required
                    value={manualOrderForm.phone}
                    onChange={(e) => setManualOrderForm({ ...manualOrderForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                    placeholder="+252 ..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Partner Restaurant</label>
                  <select
                    value={manualOrderForm.restaurant}
                    onChange={(e) => setManualOrderForm({ ...manualOrderForm, restaurant: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                  >
                    {partnerRestaurants.map((r) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Total Price ($)</label>
                  <input
                    required
                    value={manualOrderForm.total}
                    onChange={(e) => setManualOrderForm({ ...manualOrderForm, total: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                    placeholder="e.g. 15.00"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Items Ordered</label>
                <input
                  required
                  value={manualOrderForm.items}
                  onChange={(e) => setManualOrderForm({ ...manualOrderForm, items: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                  placeholder="e.g. 2x Pepperoni Pizza Large, Coke"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Delivery Address</label>
                <input
                  value={manualOrderForm.address}
                  onChange={(e) => setManualOrderForm({ ...manualOrderForm, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-[#044C34]"
                  placeholder="e.g. Garowe Center, Near Wadajir Hotel"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManualOrderModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="rounded-xl bg-[#044C34] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#044C34]/20 hover:bg-[#033b28] disabled:opacity-50"
                >
                  {isSubmittingOrder ? 'Dispatching...' : 'Dispatch Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#16A34A]">PuntGo Receipt Breakdown</p>
                <h3 className="text-xl font-black text-slate-900">{selectedOrderDetails.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex border-b border-slate-100 mb-4">
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold ${activeOrderTab === 'details' ? 'border-b-2 border-[#044C34] text-[#044C34]' : 'text-slate-500'}`}
                onClick={() => setActiveOrderTab('details')}
              >
                Order Details
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-bold ${activeOrderTab === 'chat' ? 'border-b-2 border-[#044C34] text-[#044C34]' : 'text-slate-500'}`}
                onClick={() => setActiveOrderTab('chat')}
              >
                Live Chat Logs
              </button>
            </div>

            {activeOrderTab === 'details' ? (
              <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-50 pb-2.5">
                <span className="font-bold text-slate-500">Customer Name</span>
                <span className="font-black text-slate-900">{selectedOrderDetails.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2.5">
                <span className="font-bold text-slate-500">Phone Number</span>
                <span className="font-semibold text-[#044C34]">{selectedOrderDetails.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2.5">
                <span className="font-bold text-slate-500">Restaurant</span>
                <span className="font-bold text-slate-900">{selectedOrderDetails.restaurant}</span>
              </div>
              <div className="border-b border-slate-50 pb-4">
                <span className="font-bold text-slate-500 block mb-3">Items Ordered</span>
                {selectedOrderDetails.rawItems && selectedOrderDetails.rawItems.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrderDetails.rawItems.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <span className="font-bold text-slate-900 leading-tight">
                                {item.quantity || 1}x {item.name}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded-md ml-2 border border-slate-300">
                                📍 {item.restaurant_name || item.restaurantName || selectedOrderDetails.restaurant}
                              </span>
                            </div>
                            <span className="font-bold text-[#044C34] text-[11px] ml-2 shrink-0">
                              ${Number(item.item_total_price || (item.base_price * (item.quantity || 1)) || 0).toFixed(2)}
                            </span>
                          </div>
                          {item.selected_variant && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">
                              Variant: {item.selected_variant.name} (${Number(item.selected_variant.price).toFixed(2)})
                            </span>
                          )}
                          {item.selected_addons && item.selected_addons.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {item.selected_addons.map((a: any, i: number) => (
                                <span key={i} className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  + {a.name} (${Number(a.price).toFixed(2)})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="font-semibold text-slate-800">
                    {safeRenderItems(selectedOrderDetails.items)}
                  </span>
                )}
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2.5">
                <span className="font-bold text-slate-500">Delivery Address</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px]">{selectedOrderDetails.address}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2.5">
                <span className="font-bold text-slate-500">Current Status</span>
                <span className="font-extrabold text-emerald-700">{selectedOrderDetails.status}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2.5">
                <span className="font-bold text-slate-500">Assigned Driver</span>
                <span className="font-bold text-slate-900">{selectedOrderDetails.driver || 'No driver assigned yet'}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm">
                <span className="font-black text-slate-900">Total Amount</span>
                <span className="font-black text-[#044C34]">{selectedOrderDetails.total}</span>
              </div>
              </div>
            ) : (
              <div className="flex flex-col h-[400px]">
                <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-50 rounded-xl mb-3 border border-slate-100">
                  {orderMessages.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-10 font-medium">No messages yet.</p>
                  ) : (
                    orderMessages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender_role === 'admin' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs shadow-sm ${msg.sender_role === 'admin' ? 'bg-[#044C34] text-white rounded-br-sm' : msg.sender_role === 'driver' ? 'bg-amber-100 text-amber-900 border border-amber-200 rounded-bl-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'}`}>
                          <p className="font-bold text-[9px] opacity-70 mb-0.5 uppercase tracking-wider">{msg.sender_name} ({msg.sender_role})</p>
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={newAdminMessage}
                    onChange={(e) => setNewAdminMessage(e.target.value)}
                    placeholder="Type support message..."
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#044C34]"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAdminMessage()}
                  />
                  <button
                    onClick={handleSendAdminMessage}
                    className="rounded-xl bg-[#044C34] px-4 py-2 font-bold text-white text-xs hover:bg-[#033b28]"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="w-full rounded-xl bg-[#044C34] py-3 text-xs font-bold text-white shadow-md hover:bg-[#033b28]"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Restaurant Menu Slide-Over Modal */}
      {selectedRestaurantForMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm transition-opacity">
          <div className="h-full w-full max-w-2xl bg-white p-6 md:p-8 shadow-2xl flex flex-col overflow-y-auto">
            <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-5 shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-3xl border border-emerald-100 shadow-inner overflow-hidden shrink-0">
                  {(() => {
                    const logoStr = selectedRestaurantForMenu.logoImage || selectedRestaurantForMenu.emoji || '🏪';
                    return logoStr.startsWith('http://') || logoStr.startsWith('https://') || logoStr.startsWith('data:image/') ? (
                      <img src={logoStr} alt={selectedRestaurantForMenu.name} className="w-12 h-12 rounded-2xl object-cover" />
                    ) : (
                      <span className="text-2xl">{logoStr}</span>
                    );
                  })()}
                </span>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{selectedRestaurantForMenu.name} Menu</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Manage dishes, categories, and live availability for {selectedRestaurantForMenu.name} • {selectedRestaurantForMenu.address}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedRestaurantForMenu(null); setEditingDishId(null); }}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Add / Edit Dish Form Inside Modal */}
            <div className="mb-6 rounded-2xl bg-slate-50 border border-slate-200/80 p-5 shrink-0 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Plus size={16} className="text-[#044C34]" /> {editingDishId !== null ? `Editing Product: ${menuModalForm.name}` : `Add Food Item to ${selectedRestaurantForMenu.name}`} (Mobile App Sync)
                </h4>
                {editingDishId !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDishId(null)
                      setMenuModalForm({ name: '', category: 'Pizza', price: '', stock: 'In Stock', imageUrl: '', imageUrl2: '', imageUrl3: '', rating: '4.8 ★', description: '', prepTime: '20 mins', calories: '300 kcal', add_ons: [], variants: [] })
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleMenuModalSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="mb-1 block text-[11px] font-bold text-slate-600">🍲 Dish Name</label>
                  <input
                    required
                    value={menuModalForm.name}
                    onChange={(e) => setMenuModalForm({ ...menuModalForm, name: e.target.value })}
                    placeholder="e.g. Pepperoni Pizza"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-600">📂 Category (11 App Categories)</label>
                  <select
                    value={menuModalForm.category}
                    onChange={(e) => setMenuModalForm({ ...menuModalForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                  >
                    {dbCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-600">💵 Price ($)</label>
                  <input
                    value={(menuModalForm.variants && menuModalForm.variants.length > 0) ? Math.min(...menuModalForm.variants.map((v: any) => Number(v.price) || 0)).toString() : menuModalForm.price}
                    onChange={(e) => setMenuModalForm({ ...menuModalForm, price: e.target.value })}
                    readOnly={menuModalForm.variants && menuModalForm.variants.length > 0}
                    placeholder="e.g. 12.99"
                    className={`w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34] ${(menuModalForm.variants && menuModalForm.variants.length > 0) ? 'bg-slate-50' : 'bg-white'}`}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-600">📦 Availability</label>
                  <select
                    value={menuModalForm.stock}
                    onChange={(e) => setMenuModalForm({ ...menuModalForm, stock: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-600">⏱️ Prep/Delivery Time</label>
                  <input
                    value={menuModalForm.prepTime}
                    onChange={(e) => setMenuModalForm({ ...menuModalForm, prepTime: e.target.value })}
                    placeholder="e.g. 20 mins"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-600">🔥 Calories</label>
                  <input
                    value={menuModalForm.calories}
                    onChange={(e) => setMenuModalForm({ ...menuModalForm, calories: e.target.value })}
                    placeholder="e.g. 300 kcal"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-600">⭐ Rating</label>
                  <input
                    value={menuModalForm.rating}
                    onChange={(e) => setMenuModalForm({ ...menuModalForm, rating: e.target.value })}
                    placeholder="e.g. 4.8 ★"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                  />
                </div>
                <div className="sm:col-span-2 md:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600">🖼️ Image Selection (1 to 3 Images via Supabase Storage)</label>
                    {uploadingImage && <span className="text-[11px] font-bold text-blue-600 animate-pulse">⏳ Uploading to Supabase Storage...</span>}
                  </div>
                  <div className="space-y-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
                    {/* Slot 1 */}
                    <div>
                      <span className="block text-[11px] font-extrabold text-slate-700 mb-1">Primary Image 1 (Main Hero) *</span>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <label className="cursor-pointer rounded-xl border border-dashed border-[#044C34]/40 bg-white px-3 py-2 text-xs font-bold text-[#044C34] hover:bg-emerald-50 transition flex items-center justify-center gap-1.5 shrink-0">
                          <span>📁 Upload Photo 1</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'menu')} className="hidden" />
                        </label>
                        <input
                          value={menuModalForm.imageUrl}
                          onChange={(e) => setMenuModalForm({ ...menuModalForm, imageUrl: e.target.value })}
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                          placeholder="Storage URL or direct Photo URL"
                        />
                      </div>
                      {menuModalForm.imageUrl && <img src={menuModalForm.imageUrl} alt="Slot 1" className="mt-1.5 w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm" />}
                    </div>

                    {/* Slot 2 */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="block text-[11px] font-extrabold text-slate-700 mb-1">Image 2 (Optional - Angle View)</span>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <label className="cursor-pointer rounded-xl border border-dashed border-[#044C34]/40 bg-white px-3 py-2 text-xs font-bold text-[#044C34] hover:bg-emerald-50 transition flex items-center justify-center gap-1.5 shrink-0">
                          <span>📁 Upload Photo 2</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'menu2')} className="hidden" />
                        </label>
                        <input
                          value={menuModalForm.imageUrl2 || ''}
                          onChange={(e) => setMenuModalForm({ ...menuModalForm, imageUrl2: e.target.value })}
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                          placeholder="Storage URL or direct Photo URL"
                        />
                      </div>
                      {menuModalForm.imageUrl2 && <img src={menuModalForm.imageUrl2} alt="Slot 2" className="mt-1.5 w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm" />}
                    </div>

                    {/* Slot 3 */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="block text-[11px] font-extrabold text-slate-700 mb-1">Image 3 (Optional - Close Up Detail)</span>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <label className="cursor-pointer rounded-xl border border-dashed border-[#044C34]/40 bg-white px-3 py-2 text-xs font-bold text-[#044C34] hover:bg-emerald-50 transition flex items-center justify-center gap-1.5 shrink-0">
                          <span>📁 Upload Photo 3</span>
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'menu3')} className="hidden" />
                        </label>
                        <input
                          value={menuModalForm.imageUrl3 || ''}
                          onChange={(e) => setMenuModalForm({ ...menuModalForm, imageUrl3: e.target.value })}
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                          placeholder="Storage URL or direct Photo URL"
                        />
                      </div>
                      {menuModalForm.imageUrl3 && <img src={menuModalForm.imageUrl3} alt="Slot 3" className="mt-1.5 w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm" />}
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2 md:col-span-4">
                  <label className="mb-1 block text-[11px] font-bold text-slate-600">📝 Description (Detailed Product Text for Mobile App Details Screen)</label>
                  <textarea
                    rows={2}
                    value={menuModalForm.description}
                    onChange={(e) => setMenuModalForm({ ...menuModalForm, description: e.target.value })}
                    placeholder="A classic favorite! Indulge in a crispy, thin crust topped with rich tomato sauce..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-[#044C34]"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-slate-600">➕ Add-Ons / Included Extras</label>
                    <button type="button" onClick={addMenuModalAddOn} disabled={(menuModalForm?.add_ons || []).length >= 10} className="text-[10px] font-bold text-[#044C34] hover:underline disabled:opacity-50">
                      + Add Extra Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(menuModalForm?.add_ons || []).map((addon, index) => (
                      <div key={addon.id} className="flex gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex gap-2">
                            <input type="text" value={addon.name} onChange={e => updateMenuModalAddOn(addon.id, 'name', e.target.value)} placeholder="e.g. Extra Sauce" className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] outline-none focus:border-[#044C34]" />
                            <input type="text" value={addon.price} onChange={e => updateMenuModalAddOn(addon.id, 'price', e.target.value)} placeholder="Price ($0.00)" className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-[11px] outline-none focus:border-[#044C34]" />
                          </div>
                          <input type="text" value={addon.description} onChange={e => updateMenuModalAddOn(addon.id, 'description', e.target.value)} placeholder="Description (Optional)" className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] outline-none focus:border-[#044C34]" />
                        </div>
                        <button type="button" onClick={() => removeMenuModalAddOn(addon.id)} className="p-1.5 h-fit rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 md:col-span-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-slate-600">🎛️ Product Variants / Options</label>
                    <button type="button" onClick={addMenuModalVariant} className="text-[10px] font-bold text-[#044C34] hover:underline">
                      + Add Variant Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(menuModalForm?.variants || []).map((variant, index) => (
                      <div key={variant.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <input type="radio" checked={variant.is_default} onChange={() => setMenuModalVariantDefault(variant.id)} name="menuModalVariantDefault" className="w-3.5 h-3.5 accent-[#044C34]" />
                        <input type="text" value={variant.option_name} onChange={e => updateMenuModalVariant(variant.id, 'option_name', e.target.value)} placeholder="e.g. Boneless" className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] outline-none focus:border-[#044C34]" />
                        <input type="text" value={variant.price} onChange={e => updateMenuModalVariant(variant.id, 'price', e.target.value)} placeholder="Price ($)" className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-[11px] outline-none focus:border-[#044C34]" />
                        <button type="button" onClick={() => removeMenuModalVariant(variant.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2 md:col-span-4 flex justify-end mt-1 gap-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#044C34] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#033b28] transition flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>{editingDishId !== null ? `Save Updated Product` : `Add Dish to Menu & Mobile Grid`}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Menu List Categorized by exact 11 categories */}
            <div className="flex-1 space-y-6">
              {dbCategories.map(c => c.name).map((cat) => {
                const catClean = cat.replace(/^[\u2000-\u3300\uD83C-\uDBFF\uDC00-\uDFFF\s]+/g, "").trim().toLowerCase();
                const catItems = restaurantDishes.filter((item) => {
                  const itemClean = (item.category || "").replace(/^[\u2000-\u3300\uD83C-\uDBFF\uDC00-\uDFFF\s]+/g, "").trim().toLowerCase();
                  return itemClean === catClean || itemClean.includes(catClean) || catClean.includes(itemClean);
                });
                if (catItems.length === 0) return null
                return (
                  <div key={cat} className="space-y-2.5">
                    <h5 className="text-xs font-black uppercase tracking-wider text-[#044C34] border-b border-slate-100 pb-1.5 flex items-center justify-between">
                      <span>{cat}</span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{catItems.length} dishes</span>
                    </h5>
                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                      {catItems.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition text-xs gap-3">
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm" />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl shrink-0 border border-slate-200">
                                🍽️
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-extrabold text-slate-900 text-sm">{item.name}</p>
                                <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60 shrink-0">
                                  {item.rating || '4.8 ★'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">{item.description || 'Rich authentic preparation with fresh local ingredients.'}</p>
                              <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-500 flex-wrap">
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                                  <Clock size={11} className="text-[#044C34]" />
                                  {item.prepTime || '20 mins'}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-orange-700 border border-orange-200/50">
                                  <Flame size={11} className="text-orange-600" />
                                  {item.calories || '300 kcal'}
                                </span>
                                <span className="text-slate-400 font-semibold">• Category: {item.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                            <span className="font-black text-slate-900 text-sm">{item.price}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                              item.stock === 'In Stock'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : item.stock === 'Low Stock'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {item.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEditDish(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/60 text-emerald-800 font-bold hover:bg-[#044C34] hover:text-white transition"
                              title="Edit product details"
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={async () => { 
                                await supabase.from('food_items').delete().eq('id', item.id); 
                                setRestaurantDishes(prev => prev.filter(d => d.id !== item.id));
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Delete dish"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {restaurantDishes.length === 0 && (
                <div className="py-12 text-center text-slate-400 font-semibold text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  No menu items yet for {selectedRestaurantForMenu.name}. Add one above using the 10 mobile app categories!
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRestaurantForMenu(null)}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}


      {/* New Driver Modal */}
      {driverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Add New Rider</h3>
                <p className="text-xs text-slate-400 mt-0.5">Register a new delivery driver to the fleet.</p>
              </div>
              <button
                type="button"
                onClick={() => setDriverModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Abdi Jama"
                  value={newDriverForm.full_name}
                  onChange={(e) => setNewDriverForm({ ...newDriverForm, full_name: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#044C34]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +252 90 7000000"
                  value={newDriverForm.phone}
                  onChange={(e) => setNewDriverForm({ ...newDriverForm, phone: e.target.value })}
                  className="w-full mt-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#044C34]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">PIN Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 1234"
                    maxLength={4}
                    value={newDriverForm.pin_code}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, pin_code: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#044C34] text-center tracking-widest font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Vehicle Type</label>
                  <select
                    value={newDriverForm.vehicle_type}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, vehicle_type: e.target.value })}
                    className="w-full mt-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-[#044C34]"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Car">Car</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDriverModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
                className="flex-1 rounded-xl bg-[#044C34] py-3 text-sm font-black text-white hover:bg-[#033b28] shadow-md shadow-[#044C34]/20"
              >
                Add Rider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">Rejection Reason</p>
                <h3 className="text-xl font-black text-slate-900">Cancel Order {orderToCancel}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCancelPromptOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 my-4">
              {['Restaurant Closed', 'Item Out of Stock', 'Payment/Address Verification Failed', 'Custom Reason...'].map(reason => (
                <button
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left transition ${cancelReason === reason ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-700 hover:border-red-200 hover:bg-slate-50'}`}
                >
                  <span className="text-sm font-bold">❌ {reason}</span>
                </button>
              ))}

              {cancelReason === 'Custom Reason...' && (
                <div className="mt-3">
                  <textarea
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    placeholder="Enter custom rejection reason..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setCancelPromptOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                disabled={!cancelReason || (cancelReason === 'Custom Reason...' && !customCancelReason.trim())}
                className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {typeof toastMessage !== 'undefined' && toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#044C34] text-white px-5 py-3.5 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}
    </div>
  )
}
