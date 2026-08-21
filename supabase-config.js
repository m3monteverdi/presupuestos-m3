// =====================================
// CONEXIÓN CON SUPABASE
// =====================================

const SUPABASE_URL =
    "https://qdpwabxmmvsxcamifgpn.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_HipukRARrC36PyP79pZPzQ_EIYmqhut";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


console.log(
    "Supabase conectado correctamente"
);
async function probarSupabase() {

    const { data, error } =
        await supabaseClient
            .from("precios")
            .select("*");


    if (error) {

        console.error(
            "Error leyendo precios:",
            error
        );

        return;

    }


    console.log(
        "Precios recibidos desde Supabase:",
        data
    );

}


probarSupabase();