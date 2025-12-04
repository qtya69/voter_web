Itt található a rendszer részletes műszaki és felhasználói dokumentációja. Ez a dokumentum lefedi a rendszer célját, architektúráját, az adatmodelleket, a működési logikát és a telepítési lépéseket.

---

# Társasházi Közgyűlés Szavazórendszer – Dokumentáció

---

## 1. A Rendszer Célja
A szoftver célja, hogy a társasházi közgyűléseken a szavazás folyamatát digitalizálja, gyorsítsa és hibamentessé tegye. A rendszer legfontosabb tulajdonsága, hogy **nem darabszámra, hanem tulajdoni hányadra (th.)** összesíti a szavazatokat, valós időben számolja a határozatképességet, és azonnal jegyzőkönyvezhető eredményt biztosít.

---

## 2. Rendszerarchitektúra

A rendszer jelenleg egy **Single Page Application (SPA)**, amely Angular keretrendszerben készült. Mivel backend szerver jelenleg még nincs, az üzleti logikát és az adattárolást egy kliens oldali szolgáltatás (`VotingService`) szimulálja memóriában.

### Adatfolyam
1.  A felhasználói interakciók (klikkek) meghívják a `VotingService` metódusait.
2.  A Service frissíti a belső állapotot (`AppState`).
3.  A változást a `state$` Observable azonnal "kisugározza" (push) az összes feliratkozott komponensnek (Admin és Szavazó felület).
4.  A nézetek automatikusan frissülnek (Change Detection).

---

## 3. Adatmodellek (`models.ts`)

A rendszer alapja a szigorúan típusos adatstruktúra.

### 3.1. Tulajdonos (`Owner`)
Egy természetes vagy jogi személy, aki szavazati joggal rendelkezik.
*   `id`: Egyedi azonosító.
*   `name`: Megjelenített név (pl. "Minta János").
*   `share`: Tulajdoni hányad (pl. 245 / 10000).

### 3.2. Albetét (`Apartment`)
A lakás vagy üzlethelyiség, amelyhez a tulajdonosok tartoznak.
*   `address`: Cím (pl. "Minta u. 28. 2.em 3.").
*   `hrsz`: Helyrajzi szám.
*   `totalShare`: Az albetét teljes tulajdoni hányada.
*   `owners`: Az albetéthez tartozó tulajdonosok listája.

### 3.3. Szavazat (`Vote`)
Egy leadott szavazat rekordja.
*   `ownerId`, `ownerName`: Ki szavazott.
*   `share`: Mekkora súllyal (tulajdoni hányad).
*   `choice`: A döntés (`IGEN` | `NEM` | `TARTÓZKODIK`).

### 3.4. Napirendi Pont (`AgendaItem`)
*   `status`:
    *   `PENDING`: Még nem tárgyalt (inaktív).
    *   `ACTIVE`: Jelenleg szavazható (gombok aktívak).
    *   `CLOSED`: Lezárt, eredmény végleges.
*   `votes`: A leadott szavazatok tömbje.
*   `speakers`: Felszólalók listája (jegyzőkönyvhöz).

---

## 4. Fő Komponensek és Működés

### 4.1. VotingService (`services/voting.service.ts`)
Ez a rendszer "agya".
*   **Mock Adatok:** Itt vannak definiálva a lakások és a napirendi pontok (később ezt API hívás váltja ki).
*   **State (`state$`):** Egyetlen igazság forrása (Single Source of Truth). Tartalmazza:
    *   Jelenlévők összesített hányadát (`presentShare`).
    *   Aktuális felhasználót.
    *   Napirendi pontok állapotát.
*   **Logika:**
    *   `login()`: Belépteti a felhasználót és növeli a `presentShare` értékét.
    *   `castVote()`: Ellenőrzi, hogy szavazott-e már, és ha nem, rögzíti a szavazatot.
    *   `setAgendaStatus()`: Adminisztrátori funkció a szavazás indítására/lezárására.

### 4.2. Login Component (`components/login`)
*   **Feladat:** Kétlépcsős azonosítás szimulációja.
    1.  Albetét kiválasztása.
    2.  Tulajdonos kiválasztása az adott albetétből.
*   **Navigáció:** Sikeres belépés után a `/voter` oldalra irányít. Van egy rejtett gomb az `/admin` felülethez is.

### 4.3. Voter Dashboard (`components/voter-dashboard`)
A tulajdonosok felülete.
*   **Reaktivitás:** Folyamatosan figyeli a `state$`-t. Ha egy napirendi pont státusza `ACTIVE`-ra vált, megjelennek a gombok.
*   **Szavazás:** Csak egyszer enged szavazni egy pontra. A gombnyomás után a felület visszajelzést ad ("Szavazat rögzítve").
*   **Felszólalás:** A "Felszólalok" gomb jelzést küld az adminnak, ami bekerül a naplóba.

### 4.4. Admin Dashboard (`components/admin-dashboard`)
A közös képviselő / levezető elnök felülete.
*   **Statisztika:** Valós időben mutatja a határozatképességet (Jelenlévők th. / Összes th.).
*   **Vezérlés:**
    *   *Indítás:* `PENDING` -> `ACTIVE` (Szavazógombok megjelennek a felhasználóknál).
    *   *Lezárás:* `ACTIVE` -> `CLOSED` (Szavazás vége, eredmény rögzül).
*   **Monitorozás:**
    *   Látja, hány tulajdoni hányad hiányzik még a szavazáshoz (piros jelzés).
    *   Látja az IGEN/NEM/TARTÓZKODIK arányokat számokban.
*   **Export:** A "Jegyzőkönyv Exportálása" gomb a böngésző nyomtatási nézetét hívja meg, ami PDF-be menthető.

---

## 5. Telepítési és Futtatási Útmutató

Mivel ez egy Angular projekt, a Node.js környezet szükséges hozzá.

### Előfeltételek
*   Node.js (v18 vagy újabb)
*   npm (Node Package Manager)

### Lépések
1.  **Projekt letöltése/kibontása.**
2.  **Függőségek telepítése:**
    Nyiss egy terminált a projekt mappájában:
    ```bash
    npm install
    ```
3.  **Futtatás fejlesztői módban:**
    ```bash
    ng serve --open
    ```
4.  **Megnyitás:**
    *`http://localhost:4200/`

---

## 6. Felhasználói Útmutató (Szimuláció)

A rendszer teszteléséhez érdemes két böngészőablakot (vagy egy normál és egy inkognitó ablakot) használni.

### 1. Adminisztrátor (Közös Képviselő)
1.  Nyissa meg a `http://localhost:4200/admin` oldalt.
2.  Ellenőrizze a "Jelenléti Statisztikát" (kezdetben 0).
3.  Várja meg, amíg a tulajdonosok bejelentkeznek.
4.  Az 1. napirendi pontnál nyomja meg a **"Szavazás INDÍTÁSA"** gombot.
5.  Figyelje a beérkező szavazatokat valós időben.
6.  Ha mindenki szavazott (vagy lejárt az idő), nyomja meg a **"Szavazás LEZÁRÁSA"** gombot.
7.  A közgyűlés végén nyomja meg a **"Jegyzőkönyv Exportálása"** gombot.

### 2. Tulajdonos (Szavazó)
1.  Nyissa meg a `http://localhost:4200/` oldalt.
2.  Válassza ki a lakását (pl. "Minta utca 28...").
3.  Válassza ki a nevét (pl. "Minta János").
4.  Kattintson a **"Belépés"** gombra.
5.  Várjon, amíg a napirendi pont zöld keretes nem lesz (`ACTIVE`).
6.  Szavazzon (IGEN / NEM / TARTÓZKODIK).

---

## 7. Továbbfejlesztési Terv (Roadmap)

Ez a verzió egy működő prototípus (MVP). Éles használathoz a következő fejlesztések szükségesek:

1.  **Backend Implementáció:**
    *   Jelenleg az adatok frissítéskor elvesznek. Szükséges egy adatbázis és egy szerver.
2.  **Hitelesítés (Authentication):**
    *   Jelenleg bárki kiválaszthat bárkit a listából. Élesben jelszavas (vagy egyedi kódos (QR kód) belépés szükséges).
3.  **Valós idejű kommunikáció (WebSockets):**
    *   Bár az RxJS jól kezeli az állapotot, több eszköz közötti azonnali szinkronizációhoz (hogy az Admin lássa, amit a User csinál külön gépen) Socket.io vagy Firebase használata javasolt.
4.  **Meghatalmazások kezelése:**
    *   Dokumentumfeltöltés és adminisztrátori jóváhagyás a meghatalmazottakhoz.
5.  **PDF Generálás:**
    *   Szerver oldali, hivatalos formátumú PDF generálás a böngészős nyomtatás helyett.