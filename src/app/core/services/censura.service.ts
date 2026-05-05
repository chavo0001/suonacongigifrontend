import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaccia della risposta del backend
interface CensuraResponse {
    data: { censuraAttiva: boolean };
    message: string;
}

@Injectable({ providedIn: 'root' })
export class CensuraService {

    private readonly apiUrl = `${environment.apiUrl}/users/me/censura`;

    // Stato reattivo del toggle
    // Quando cambia questo valore, tutti i componenti che lo leggono si aggiornano automaticamente
    readonly censuraAttiva = signal<boolean>(true); // Default: filtro ON

    // Computed: possiamo derivare altri valori dal signal
    readonly etichettaToggle = computed(() =>
        this.censuraAttiva() ? '🛡️ Filtro attivo' : '🔓 Filtro disattivo'
    );

    constructor(private http: HttpClient) { }

    // Chiama il backend per sapere lo stato attuale del filtro
    caricaStato(): Observable<CensuraResponse> {
        return this.http.get<CensuraResponse>(this.apiUrl).pipe(
            tap(res => {
                // Aggiorniamo il signal con il valore reale del database
                this.censuraAttiva.set(res.data.censuraAttiva);
            })
        );
    }


    // Cambia il toggle e salva la preferenza nel backend
    toggleCensura(): Observable<CensuraResponse> {
        const nuovoStato = !this.censuraAttiva(); // Invertiamo lo stato attuale

        return this.http.put<CensuraResponse>(this.apiUrl, { attiva: nuovoStato }).pipe(
            tap(res => {
                // Aggiorniamo il signal con la conferma del backend
                this.censuraAttiva.set(res.data.censuraAttiva);
            })
        );
    }

    // Questo metodo riproduce la stessa logica del backend in TypeScript.
    // Può essere usato per una risposta IMMEDIATA all'utente mentre
    // la richiesta HTTP è ancora in volo.
    filtraClientSide(testo: string): string {
        if (!this.censuraAttiva() || !testo) return testo;

        // Lista minima di pattern lato client (solo per anteprima immediata)
        // La lista completa è gestita dal backend tramite DB
        const patternDiTest = [
            /c[\s.\-_]*a[\s.\-_]*z[\s.\-_]*z[\s.\-_]*o/gi,
            /m[\s.\-_]*e[\s.\-_]*r[\s.\-_]*d[\s.\-_]*a/gi,
            /s[\s.\-_]*t[\s.\-_]*r[\s.\-_]*o[\s.\-_]*n[\s.\-_]*z[\s.\-_]*o/gi,
        ];

        let risultato = testo;
        for (const pattern of patternDiTest) {
            risultato = risultato.replace(pattern, match => '*'.repeat(match.length));
        }
        return risultato;
    }
}
