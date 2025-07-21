# Quiz Multiplayer - Gra dla Dwóch

Multiplayer quiz game dla dwóch graczy zbudowana z Deno, TypeScript, WebSockets i Deno KV.

## ✨ Funkcje

- **Multiplayer w czasie rzeczywistym** - WebSocket komunikacja
- **System tur** - sprawiedliwa rozgrywka z równymi szansami dla obu graczy
- **Rundy** - gra toczy się przez maksymalnie 3 rundy
- **Punktacja** - pierwszy gracz do 3 punktów wygrywa (ale tylko jeśli drugi miał równe szanse)
- **Dogrywka** - w przypadku remisu gra się dalej do rozstrzygnięcia
- **Responsywny design** - stylizowany na stare, pożółkłe książki
- **Automatyczne zarządzanie pokojami** - czyszczenie starych gier

## 🎮 Jak grać

1. **Stwórz grę** - wpisz swoją nazwę i kliknij "Stwórz nową grę"
2. **Podziel się kodem** - przekaż 4-cyfrowy kod drugiemu graczowi
3. **Dołącz do gry** - drugi gracz wpisuje kod i swoją nazwę
4. **Zadawaj pytania** - w swojej turze stwórz pytanie wielokrotnego wyboru
5. **Odpowiadaj** - gdy przeciwnik zada pytanie, wybierz odpowiedź
6. **Wygraj** - pierwszy do 3 punktów wygrywa!

## 🏆 System tur

- Każdy gracz ma równe szanse na zadawanie pytań i odpowiadanie
- Gra toczy się przez rundy - każdy gracz musi mieć szansę odpowiedzieć w rundzie
- Jeśli gracz osiągnie 3 punkty, ale przeciwnik nie miał jeszcze równych szans, gra trwa dalej
- W przypadku remisu po 3 rundach, gra przechodzi w tryb dogrywki

## 🚀 Uruchomienie lokalnie

### Wymagania
- [Deno](https://deno.land/) v1.40+

### Instalacja i uruchomienie

```bash
# Sklonuj repozytorium
git clone <repository-url>
cd quiz-game

# Uruchom serwer deweloperski
deno task dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:8000`

## 📦 Deployment na Deno Deploy

1. **Przygotuj projekt**:
   ```bash
   # Upewnij się, że wszystkie pliki są gotowe
   deno task check
   ```

2. **Deploy przez GitHub**:
   - Wypchnij kod na GitHub
   - Połącz repozytorium z [Deno Deploy](https://dash.deno.com/)
   - Ustaw entry point na `main.ts`
   - Deploy zostanie wykonany automatycznie

3. **Deploy przez CLI**:
   ```bash
   # Zainstaluj Deno Deploy CLI
   deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts

   # Deploy projektu
   deployctl deploy --project=your-project-name main.ts
   ```

## 🛠 Technologie

- **Backend**: Deno + TypeScript
- **Database**: Deno KV (wbudowana baza klucz-wartość)
- **WebSockets**: Natywne WebSocket API Deno
- **Frontend**: Vue 3 + Tailwind CSS
- **Hosting**: Deno Deploy

## 📁 Struktura projektu

```
quiz-game/
├── main.ts                 # Główny serwer
├── deno.json              # Konfiguracja Deno
├── public/
│   └── index.html         # Frontend aplikacji
├── src/
│   ├── types/
│   │   └── game.ts        # Definicje typów TypeScript
│   └── server/
│       └── gameManager.ts # Logika gry i zarządzanie pokojami
└── README.md
```

## 🎨 Design

Aplikacja została zaprojektowana w stylu starych, pożółkłych książek z:
- Kolorystyką pergaminu i atramentu
- Czcionkami serif (Crimson Text, Libre Baskerville)
- Cieniami i teksturami przypominającymi stare strony
- Responsywnym layoutem

## 🔧 Konfiguracja

### Zmienne środowiskowe
- `PORT` - port serwera (domyślnie 8000)

### Deno permissions
Aplikacja wymaga następujących uprawnień:
- `--allow-net` - komunikacja sieciowa
- `--allow-read` - odczyt plików statycznych
- `--allow-write` - zapis do Deno KV
- `--allow-env` - dostęp do zmiennych środowiskowych
- `--unstable-kv` - dostęp do Deno KV

## 📝 Licencja

MIT License