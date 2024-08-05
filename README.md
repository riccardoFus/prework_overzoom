# prework_overzoom

SCENARIO

Un azienda che opera nel settore automotive ha bisogno di un software per la gestione del proprio parco auto e degli interventi di manutenzione effettuati nella sua officina.
Ci sono due tipologie di utenti: gli ADMIN, che rappresentano gli utenti interni all'azienda, e i CUSTOMER che rappresentano l'accesso dedicato al cliente.
L'obbiettivo è avere un backoffice (dedicato agli ADMIN) che permetta di monitorare l'andamento dell'azienda e un frontoffice (dedicato ai CUSTOMER) che permetta ai clienti di verificare le prossime scandenze per la manutenzione del proprio mezzo.

ARCHITETTURA

È stata scelta un'architettura client-server con server hostato in cloud ed accesso autenticato.
La parte client non è oggetto d'analisi, mentre per il server si è scelto di realizzare un server API in Node.js che esponga diversi endpoint RESTche svolgano le operazioni richieste.

REQUISITI

- database: MongoDB (done)
- linguaggio: Javascript
- framework API: express.js
- autenticazione: token JWT
- password salvate crittografate
- versioning: Git con repository pubblica su [github.com](http://github.com/) (to fix)

OPERAZIONI RICHIESTE

GESTIONE UTENTI

- [ ]  il server, allo start, crea l'utente con email [admin@automotive.com](mailto:admin@automotive.com) e passord admin123! (se non presente, altrimenti skippa la creazione)
- [ ]  implementazione di un servizio di mailing (può trattarsi di API esterna o libreria npm, a discrezione dell'implementatore)
- [ ]  utenti divisi per ruolo (ADMIN/CUSTOMER) gli ADMIN possono solo essere creati da un altro admin, i CUSTOMER possono registrarsi autonomamente
- [ ]  i CUSTOMER ricevono un OTP via mail per confermare la registrazione
- [ ]  possibilità di cambio password per gli utenti (ADMIN/CUSTOMER) con OTP inviato via email

GESTIONE VEICOLI

- [ ]  deve essere possibile registrare nuovi veicoli per la vendita
- [ ]  i veicoli possono essere venduti e le vendite devono essere registrate
- [ ]  deve essere possibile registrare nuovi veicoli per il monitoraggio delle manutenzioni
- [ ]  deve essere possibile registrare tutti gli interventi di manutenzione effettuati
- [ ]  deve essere possibile programmare le scadenze per la manutenzione (es. tagliando almeno una volta all'anno)
- [ ]  i clienti il cui mezzo abbia una scadenza prossima (es. scadenza tra 3 gg) deve ricevere una mail di notifica
- [ ]  per i CUSTOMER deve essere possibile aggiungere un mezzo, se questo non è presente in archivio verrà aggiunto automaticamente, se invece il mezzo è presente in archivio l'associazione può avvenire solo nel caso in cui il mezzo non risulti appartenente ad un altro CUSTOMER e sia presente una vendita che dimostri che il richiedente sia il proprietario del mezzo.
    
    GESTIONE ECONOMICA
    
- [ ]  deve essere possibile estrarre il report delle vendite in base al periodo di tempo (il perioso può essere customizzato)
- [ ]  deve essere possibile estrarre il report delle manutenzioni in base al periodo, al cliente, al mezzo o alla combinazione dei parametri appena citati