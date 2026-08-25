// =====================================
// CONEXIÓN CON SUPABASE
// =====================================

const SUPABASE_URL =
    "https://qdpwabxmmvsxcamifgpn.supabase.co";

// La publishable key es pública por diseño.
// Nunca colocar aquí una service_role key.
const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_HipukRARrC36PyP79pZPzQ_EIYmqhut";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
