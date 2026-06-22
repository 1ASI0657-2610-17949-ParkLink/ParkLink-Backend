# ParkLink — Base Render creada y data falsa cargada

> Generado automáticamente el 2026-06-22T06:22:09.213Z

## 1. Base de datos Render

| Campo | Valor |
|---|---|
| Render Postgres ID | `dpg-d8sd4hvavr4c73fki1ng-a` |
| Nombre Render | `parklink-db-lima-seed-20260622` |
| Dashboard | https://dashboard.render.com/d/dpg-d8sd4hvavr4c73fki1ng-a |
| Estado | `available` |
| Plan | `free` |
| Región | `virginia` |
| PostgreSQL | `16` |
| Database | `parklink_db_7eqn` |
| User | `parklink_user` |
| Expira | `2026-07-22T06:12:23.266964Z` |
| External URL | `postgresql://parklink_user:***@dpg-d8sd4hvavr4c73fki1ng-a.virginia-postgres.render.com:5432/parklink_db_7eqn?sslmode=require` |
| IP allow list | `0.0.0.0/0` para permitir seed local y Vercel |

> La URL completa de conexión no se imprime en este MD por seguridad. Se obtuvo mediante Render API y se usó para crear el esquema y cargar data.

## 2. Vercel actualizado y redeploy realizado

| Campo | Valor |
|---|---|
| Proyecto Vercel | `parklink-platform` |
| Project ID | `prj_QLjmh3TjMKRIVE69rjgR2p8PyNMU` |
| Team | `maximoff19s-projects` / `team_IxXwaiePaFZYxZIyYaUj1jjY` |
| Variable actualizada | `DATABASE_URL` en `production` |
| Deploy ID | `dpl_6k8T1SxQJpsS8c3xvWxkM8TYNkyD` |
| Deploy URL | https://parklink-platform-2kdz49w2e-maximoff19s-projects.vercel.app |
| Alias producción | https://parklink-platform.vercel.app |
| Estado Vercel | `READY` |

### Validaciones ejecutadas

| Prueba | Resultado |
|---|---|
| `GET https://parklink-platform.vercel.app/health` | `200 OK` |
| `POST https://parklink-platform.vercel.app/auth/login` con `driver01@parklink.test` | `201`, login correcto |
| `GET https://api-gateway-xi-five.vercel.app/health` | `200 OK` |
| `POST https://api-gateway-xi-five.vercel.app/auth/login` con `owner01@parklink.test` | `201`, proxy/login correcto |

## 3. Resumen de data insertada

| Tabla | Registros |
|---|---:|
| User | 101 |
| ParkingSpace | 120 |
| Reservation | 160 |
| Payment | 160 |
| Notification | 181 |

### Usuarios por rol

| Rol | Cantidad |
|---|---:|
| ADMIN | 1 |
| OWNER | 20 |
| DRIVER | 80 |

### Estacionamientos por distrito de Lima

| Distrito | Cantidad |
|---|---:|
| Ate | 6 |
| Barranco | 6 |
| Cercado de Lima | 6 |
| Chorrillos | 6 |
| Independencia | 6 |
| Jesús María | 6 |
| La Molina | 6 |
| Lince | 6 |
| Los Olivos | 6 |
| Magdalena del Mar | 6 |
| Miraflores | 6 |
| Pueblo Libre | 6 |
| San Borja | 6 |
| San Isidro | 6 |
| San Juan de Miraflores | 6 |
| San Martín de Porres | 6 |
| San Miguel | 6 |
| Santa Anita | 6 |
| Santiago de Surco | 6 |
| Surquillo | 6 |

### Estados de estacionamientos

| Estado | Cantidad |
|---|---:|
| AVAILABLE | 87 |
| DISABLED | 8 |
| OCCUPIED | 10 |
| RESERVED | 15 |

### Estados de reservas

| Estado | Cantidad |
|---|---:|
| ACTIVE | 21 |
| CANCELLED | 13 |
| COMPLETED | 25 |
| CONFIRMED | 68 |
| PENDING_PAYMENT | 33 |

### Estados de pagos

| Estado | Cantidad |
|---|---:|
| APPROVED | 114 |
| PENDING | 33 |
| REFUNDED | 7 |
| REJECTED | 6 |

## 4. Credenciales de usuarios falsos

Todos los usuarios fake usan la misma contraseña de prueba:

```txt
ParkLink2026!
```

| Rol | Nombre | Email | Password | Teléfono | Placa |
|---|---|---|---|---|---|
| DRIVER | Mateo Torres Quispe | `driver01@parklink.test` | `ParkLink2026!` | 970013837 | DIO-137 |
| DRIVER | Valentina Morales Díaz | `driver02@parklink.test` | `ParkLink2026!` | 970013974 | EJP-174 |
| DRIVER | Sebastián Rojas Vega | `driver03@parklink.test` | `ParkLink2026!` | 970014111 | FKQ-211 |
| DRIVER | Isabella Castillo Luna | `driver04@parklink.test` | `ParkLink2026!` | 970014248 | GLR-248 |
| DRIVER | Nicolás Herrera Soto | `driver05@parklink.test` | `ParkLink2026!` | 970014385 | HMS-285 |
| DRIVER | Camila Vargas Peña | `driver06@parklink.test` | `ParkLink2026!` | 970014522 | INT-322 |
| DRIVER | Gabriel Salinas Huerta | `driver07@parklink.test` | `ParkLink2026!` | 970014659 | JOU-359 |
| DRIVER | Mariana Ponce León | `driver08@parklink.test` | `ParkLink2026!` | 970014796 | KPV-396 |
| DRIVER | Alejandro Castro Flores | `driver09@parklink.test` | `ParkLink2026!` | 970014933 | LQW-433 |
| DRIVER | Luciana Medina Ríos | `driver10@parklink.test` | `ParkLink2026!` | 970015070 | MRX-470 |
| DRIVER | Thiago Ramírez Gómez | `driver11@parklink.test` | `ParkLink2026!` | 970015207 | NSY-507 |
| DRIVER | Antonella Cruz Aguilar | `driver12@parklink.test` | `ParkLink2026!` | 970015344 | OTZ-544 |
| DRIVER | Emiliano Chávez Paredes | `driver13@parklink.test` | `ParkLink2026!` | 970015481 | PUA-581 |
| DRIVER | Renata Silva Campos | `driver14@parklink.test` | `ParkLink2026!` | 970015618 | QVB-618 |
| DRIVER | Santiago Reyes Bravo | `driver15@parklink.test` | `ParkLink2026!` | 970015755 | RWC-655 |
| DRIVER | Samantha Lozano Núñez | `driver16@parklink.test` | `ParkLink2026!` | 970015892 | SXD-692 |
| DRIVER | Facundo Gamarra Ortiz | `driver17@parklink.test` | `ParkLink2026!` | 970016029 | TYE-729 |
| DRIVER | Ariana León Farfán | `driver18@parklink.test` | `ParkLink2026!` | 970016166 | UZF-766 |
| DRIVER | Tomás Valdez Mori | `driver19@parklink.test` | `ParkLink2026!` | 970016303 | VAG-803 |
| DRIVER | Catalina Pizarro Velásquez | `driver20@parklink.test` | `ParkLink2026!` | 970016440 | WBH-840 |
| DRIVER | Martín Calderón Saavedra | `driver21@parklink.test` | `ParkLink2026!` | 970016577 | XCI-877 |
| DRIVER | Rafaela Vera Tapia | `driver22@parklink.test` | `ParkLink2026!` | 970016714 | YDJ-914 |
| DRIVER | Rodrigo Cáceres Vilca | `driver23@parklink.test` | `ParkLink2026!` | 970016851 | ZEK-951 |
| DRIVER | Fernanda Mejía Carrillo | `driver24@parklink.test` | `ParkLink2026!` | 970016988 | AFL-988 |
| DRIVER | Daniel Benites Osorio | `driver25@parklink.test` | `ParkLink2026!` | 970017125 | BGM-125 |
| DRIVER | Paula Rengifo Arana | `driver26@parklink.test` | `ParkLink2026!` | 970017262 | CHN-162 |
| DRIVER | Adrián Salazar Peña | `driver27@parklink.test` | `ParkLink2026!` | 970017399 | DIO-199 |
| DRIVER | Bianca Lazo Galindo | `driver28@parklink.test` | `ParkLink2026!` | 970017536 | EJP-236 |
| DRIVER | Joaquín Tello Hidalgo | `driver29@parklink.test` | `ParkLink2026!` | 970017673 | FKQ-273 |
| DRIVER | Alessia Paredes Molina | `driver30@parklink.test` | `ParkLink2026!` | 970017810 | GLR-310 |
| DRIVER | Bruno Espinoza Ramos | `driver31@parklink.test` | `ParkLink2026!` | 970017947 | HMS-347 |
| DRIVER | Fiorella Cortez Aliaga | `driver32@parklink.test` | `ParkLink2026!` | 970018084 | INT-384 |
| DRIVER | Iker Sánchez Obregón | `driver33@parklink.test` | `ParkLink2026!` | 970018221 | JOU-421 |
| DRIVER | Micaela Fuentes Rojas | `driver34@parklink.test` | `ParkLink2026!` | 970018358 | KPV-458 |
| DRIVER | Dylan Campos Guevara | `driver35@parklink.test` | `ParkLink2026!` | 970018495 | LQW-495 |
| DRIVER | Daniela Bravo Mendoza | `driver36@parklink.test` | `ParkLink2026!` | 970018632 | MRX-532 |
| DRIVER | Álvaro Huamán Acosta | `driver37@parklink.test` | `ParkLink2026!` | 970018769 | NSY-569 |
| DRIVER | Josefina Cárdenas Ponce | `driver38@parklink.test` | `ParkLink2026!` | 970018906 | OTZ-606 |
| DRIVER | Gael Navarro Castillo | `driver39@parklink.test` | `ParkLink2026!` | 970019043 | PUA-643 |
| DRIVER | Regina Salas Valverde | `driver40@parklink.test` | `ParkLink2026!` | 970019180 | QVB-680 |
| DRIVER | Ignacio Delgado Rivas | `driver41@parklink.test` | `ParkLink2026!` | 970019317 | RWC-717 |
| DRIVER | Emilia Andrade Núñez | `driver42@parklink.test` | `ParkLink2026!` | 970019454 | SXD-754 |
| DRIVER | Franco Palacios León | `driver43@parklink.test` | `ParkLink2026!` | 970019591 | TYE-791 |
| DRIVER | Amanda Villar Vega | `driver44@parklink.test` | `ParkLink2026!` | 970019728 | UZF-828 |
| DRIVER | Leonardo Prado Solís | `driver45@parklink.test` | `ParkLink2026!` | 970019865 | VAG-865 |
| DRIVER | Lucía Carrillo Benavides | `driver46@parklink.test` | `ParkLink2026!` | 970020002 | WBH-902 |
| DRIVER | Maximiliano Arce Vega | `driver47@parklink.test` | `ParkLink2026!` | 970020139 | XCI-939 |
| DRIVER | Ana Paula Cornejo Luna | `driver48@parklink.test` | `ParkLink2026!` | 970020276 | YDJ-976 |
| DRIVER | Piero Ledesma Gálvez | `driver49@parklink.test` | `ParkLink2026!` | 970020413 | ZEK-113 |
| DRIVER | Ximena Ibarra Rojas | `driver50@parklink.test` | `ParkLink2026!` | 970020550 | AFL-150 |
| DRIVER | Samuel Maldonado Peña | `driver51@parklink.test` | `ParkLink2026!` | 970020687 | BGM-187 |
| DRIVER | Martina Figueroa Soto | `driver52@parklink.test` | `ParkLink2026!` | 970020824 | CHN-224 |
| DRIVER | Cristóbal Molina Flores | `driver53@parklink.test` | `ParkLink2026!` | 970020961 | DIO-261 |
| DRIVER | Abril Cáceres Prado | `driver54@parklink.test` | `ParkLink2026!` | 970021098 | EJP-298 |
| DRIVER | Andrés Ugarte Silva | `driver55@parklink.test` | `ParkLink2026!` | 970021235 | FKQ-335 |
| DRIVER | Constanza Rivera Paredes | `driver56@parklink.test` | `ParkLink2026!` | 970021372 | GLR-372 |
| DRIVER | Hugo Vásquez Ríos | `driver57@parklink.test` | `ParkLink2026!` | 970021509 | HMS-409 |
| DRIVER | Julieta Mendoza Castro | `driver58@parklink.test` | `ParkLink2026!` | 970021646 | INT-446 |
| DRIVER | Esteban Gutiérrez Torres | `driver59@parklink.test` | `ParkLink2026!` | 970021783 | JOU-483 |
| DRIVER | Valeria Cueva Campos | `driver60@parklink.test` | `ParkLink2026!` | 970021920 | KPV-520 |
| DRIVER | Raúl Poma Huerta | `driver61@parklink.test` | `ParkLink2026!` | 970022057 | LQW-557 |
| DRIVER | Daniela Peña Lazo | `driver62@parklink.test` | `ParkLink2026!` | 970022194 | MRX-594 |
| DRIVER | Diego León Salas | `driver63@parklink.test` | `ParkLink2026!` | 970022331 | NSY-631 |
| DRIVER | Clara Quispe Rivas | `driver64@parklink.test` | `ParkLink2026!` | 970022468 | OTZ-668 |
| DRIVER | Gustavo Morales Bravo | `driver65@parklink.test` | `ParkLink2026!` | 970022605 | PUA-705 |
| DRIVER | María Fernanda Soto Vera | `driver66@parklink.test` | `ParkLink2026!` | 970022742 | QVB-742 |
| DRIVER | José Miguel Ramos Vega | `driver67@parklink.test` | `ParkLink2026!` | 970022879 | RWC-779 |
| DRIVER | Sofía Valdez Camino | `driver68@parklink.test` | `ParkLink2026!` | 970023016 | SXD-816 |
| DRIVER | Pedro Navarro Ponce | `driver69@parklink.test` | `ParkLink2026!` | 970023153 | TYE-853 |
| DRIVER | Natalia Rojas Cárdenas | `driver70@parklink.test` | `ParkLink2026!` | 970023290 | UZF-890 |
| DRIVER | Luis Enrique Flores Peña | `driver71@parklink.test` | `ParkLink2026!` | 970023427 | VAG-927 |
| DRIVER | Gabriela Huerta Silva | `driver72@parklink.test` | `ParkLink2026!` | 970023564 | WBH-964 |
| DRIVER | Ángel Benavides Prado | `driver73@parklink.test` | `ParkLink2026!` | 970023701 | XCI-101 |
| DRIVER | Lorena Castillo Díaz | `driver74@parklink.test` | `ParkLink2026!` | 970023838 | YDJ-138 |
| DRIVER | Marco Antonio Reyes Mori | `driver75@parklink.test` | `ParkLink2026!` | 970023975 | ZEK-175 |
| DRIVER | Diana Salazar Cueva | `driver76@parklink.test` | `ParkLink2026!` | 970024112 | AFL-212 |
| DRIVER | Oscar Medina Arce | `driver77@parklink.test` | `ParkLink2026!` | 970024249 | BGM-249 |
| DRIVER | Elena Villanueva Lazo | `driver78@parklink.test` | `ParkLink2026!` | 970024386 | CHN-286 |
| DRIVER | Ricardo Torres Gamarra | `driver79@parklink.test` | `ParkLink2026!` | 970024523 | DIO-323 |
| DRIVER | Carolina Mendoza Pizarro | `driver80@parklink.test` | `ParkLink2026!` | 970024660 | EJP-360 |
| OWNER | Lucía Fernández Rojas | `owner01@parklink.test` | `ParkLink2026!` | 970000137 | - |
| OWNER | Carlos Mendoza Valverde | `owner02@parklink.test` | `ParkLink2026!` | 970000274 | - |
| OWNER | María José Salazar Torres | `owner03@parklink.test` | `ParkLink2026!` | 970000411 | - |
| OWNER | Jorge Luis Paredes Núñez | `owner04@parklink.test` | `ParkLink2026!` | 970000548 | - |
| OWNER | Andrea Villanueva Castro | `owner05@parklink.test` | `ParkLink2026!` | 970000685 | - |
| OWNER | Renato Quiroz Benavides | `owner06@parklink.test` | `ParkLink2026!` | 970000822 | - |
| OWNER | Sofía Aguirre Medina | `owner07@parklink.test` | `ParkLink2026!` | 970000959 | - |
| OWNER | Diego Cárdenas Flores | `owner08@parklink.test` | `ParkLink2026!` | 970001096 | - |
| OWNER | Patricia Huamán Silva | `owner09@parklink.test` | `ParkLink2026!` | 970001233 | - |
| OWNER | Miguel Ángel Rivera Soto | `owner10@parklink.test` | `ParkLink2026!` | 970001370 | - |
| OWNER | Valeria Espinoza León | `owner11@parklink.test` | `ParkLink2026!` | 970001507 | - |
| OWNER | Alonso Gutiérrez Prado | `owner12@parklink.test` | `ParkLink2026!` | 970001644 | - |
| OWNER | Claudia Navarro Ponce | `owner13@parklink.test` | `ParkLink2026!` | 970001781 | - |
| OWNER | Fernando Rivas Camino | `owner14@parklink.test` | `ParkLink2026!` | 970001918 | - |
| OWNER | Rosa María Delgado Cueva | `owner15@parklink.test` | `ParkLink2026!` | 970002055 | - |
| OWNER | Gonzalo Arce Lazo | `owner16@parklink.test` | `ParkLink2026!` | 970002192 | - |
| OWNER | Camila Bustamante Vega | `owner17@parklink.test` | `ParkLink2026!` | 970002329 | - |
| OWNER | Hernán Vargas Molina | `owner18@parklink.test` | `ParkLink2026!` | 970002466 | - |
| OWNER | Daniela Cáceres Ibarra | `owner19@parklink.test` | `ParkLink2026!` | 970002603 | - |
| OWNER | Luis Alberto Palacios Ríos | `owner20@parklink.test` | `ParkLink2026!` | 970002740 | - |
| ADMIN | Administrador ParkLink Lima | `admin@parklink.test` | `ParkLink2026!` | 999000111 | - |

## 5. Estacionamientos falsos creados — solo Lima, Perú

| Nombre | Dirección | Coordenadas | Precio/hora | Horario | Estado |
|---|---|---|---:|---|---|
| Cochera Ate 018 | Av. Nicolás Ayllón 273, Ate, Lima, Perú | -12.047205, -76.933332 | S/ 9.50 | 07:00-21:00 | DISABLED |
| Cochera Ate 038 | Av. Nicolás Ayllón 453, Ate, Lima, Perú | -12.050335, -76.929850 | S/ 7.50 | 07:00-21:00 | AVAILABLE |
| Cochera Ate 058 | Av. Nicolás Ayllón 633, Ate, Lima, Perú | -12.053232, -76.935571 | S/ 5.50 | 07:00-21:00 | AVAILABLE |
| Cochera Ate 078 | Av. Nicolás Ayllón 813, Ate, Lima, Perú | -12.055485, -76.938253 | S/ 12.50 | 07:00-21:00 | OCCUPIED |
| Cochera Ate 098 | Av. Nicolás Ayllón 993, Ate, Lima, Perú | -12.057796, -76.937358 | S/ 10.50 | 07:00-21:00 | AVAILABLE |
| Cochera Ate 118 | Av. Nicolás Ayllón 1173, Ate, Lima, Perú | -12.051571, -76.938643 | S/ 8.50 | 07:00-21:00 | AVAILABLE |
| Cochera Barranco 003 | Av. San Martín 138, Barranco, Lima, Perú | -12.144552, -77.019700 | S/ 11.00 | 08:00-22:00 | AVAILABLE |
| Cochera Barranco 023 | Av. San Martín 318, Barranco, Lima, Perú | -12.147052, -77.017510 | S/ 9.00 | 08:00-22:00 | OCCUPIED |
| Cochera Barranco 043 | Av. San Martín 498, Barranco, Lima, Perú | -12.150722, -77.015352 | S/ 7.00 | 08:00-22:00 | RESERVED |
| Cochera Barranco 063 | Av. San Martín 678, Barranco, Lima, Perú | -12.154300, -77.019323 | S/ 5.00 | 08:00-22:00 | AVAILABLE |
| Cochera Barranco 083 | Av. San Martín 858, Barranco, Lima, Perú | -12.149607, -77.021705 | S/ 12.00 | 08:00-22:00 | AVAILABLE |
| Cochera Barranco 103 | Av. San Martín 1038, Barranco, Lima, Perú | -12.151620, -77.026525 | S/ 10.00 | 08:00-22:00 | DISABLED |
| Cochera Cercado de Lima 012 | Jr. de la Unión 219, Cercado de Lima, Lima, Perú | -12.052177, -77.038173 | S/ 6.50 | 09:00-23:59 | OCCUPIED |
| Cochera Cercado de Lima 032 | Jr. de la Unión 399, Cercado de Lima, Lima, Perú | -12.050257, -77.049878 | S/ 4.50 | 09:00-23:59 | AVAILABLE |
| Cochera Cercado de Lima 052 | Jr. de la Unión 579, Cercado de Lima, Lima, Perú | -12.040784, -77.038378 | S/ 11.50 | 09:00-23:59 | DISABLED |
| Cochera Cercado de Lima 072 | Jr. de la Unión 759, Cercado de Lima, Lima, Perú | -12.052281, -77.036430 | S/ 9.50 | 09:00-23:59 | AVAILABLE |
| Cochera Cercado de Lima 092 | Jr. de la Unión 939, Cercado de Lima, Lima, Perú | -12.045865, -77.042834 | S/ 7.50 | 09:00-23:59 | RESERVED |
| Cochera Cercado de Lima 112 | Jr. de la Unión 1119, Cercado de Lima, Lima, Perú | -12.054553, -77.042973 | S/ 5.50 | 09:00-23:59 | AVAILABLE |
| Cochera Chorrillos 014 | Malecón Grau 237, Chorrillos, Lima, Perú | -12.162912, -77.029475 | S/ 4.50 | 07:00-21:00 | AVAILABLE |
| Cochera Chorrillos 034 | Malecón Grau 417, Chorrillos, Lima, Perú | -12.173989, -77.021344 | S/ 11.50 | 07:00-21:00 | OCCUPIED |
| Cochera Chorrillos 054 | Malecón Grau 597, Chorrillos, Lima, Perú | -12.170316, -77.022460 | S/ 9.50 | 07:00-21:00 | AVAILABLE |
| Cochera Chorrillos 074 | Malecón Grau 777, Chorrillos, Lima, Perú | -12.174175, -77.026031 | S/ 7.50 | 07:00-21:00 | AVAILABLE |
| Cochera Chorrillos 094 | Malecón Grau 957, Chorrillos, Lima, Perú | -12.163543, -77.017711 | S/ 5.50 | 07:00-21:00 | AVAILABLE |
| Cochera Chorrillos 114 | Malecón Grau 1137, Chorrillos, Lima, Perú | -12.168611, -77.018692 | S/ 12.50 | 07:00-21:00 | AVAILABLE |
| Cochera Independencia 017 | Av. Carlos Izaguirre 264, Independencia, Lima, Perú | -11.997884, -77.050090 | S/ 6.00 | 06:00-20:00 | AVAILABLE |
| Cochera Independencia 037 | Av. Carlos Izaguirre 444, Independencia, Lima, Perú | -11.989130, -77.052268 | S/ 4.00 | 06:00-20:00 | AVAILABLE |
| Cochera Independencia 057 | Av. Carlos Izaguirre 624, Independencia, Lima, Perú | -12.001650, -77.053386 | S/ 11.00 | 06:00-20:00 | RESERVED |
| Cochera Independencia 077 | Av. Carlos Izaguirre 804, Independencia, Lima, Perú | -11.993230, -77.051761 | S/ 9.00 | 06:00-20:00 | AVAILABLE |
| Cochera Independencia 097 | Av. Carlos Izaguirre 984, Independencia, Lima, Perú | -12.003068, -77.053518 | S/ 7.00 | 06:00-20:00 | AVAILABLE |
| Cochera Independencia 117 | Av. Carlos Izaguirre 1164, Independencia, Lima, Perú | -11.989205, -77.061704 | S/ 5.00 | 06:00-20:00 | AVAILABLE |
| Cochera Jesús María 007 | Av. Salaverry 174, Jesús María, Lima, Perú | -12.081220, -77.039556 | S/ 7.00 | 08:00-22:00 | AVAILABLE |
| Cochera Jesús María 027 | Av. Salaverry 354, Jesús María, Lima, Perú | -12.084194, -77.038142 | S/ 5.00 | 08:00-22:00 | AVAILABLE |
| Cochera Jesús María 047 | Av. Salaverry 534, Jesús María, Lima, Perú | -12.074950, -77.039813 | S/ 12.00 | 08:00-22:00 | AVAILABLE |
| Cochera Jesús María 067 | Av. Salaverry 714, Jesús María, Lima, Perú | -12.079853, -77.053174 | S/ 10.00 | 08:00-22:00 | OCCUPIED |
| Cochera Jesús María 087 | Av. Salaverry 894, Jesús María, Lima, Perú | -12.077757, -77.047941 | S/ 8.00 | 08:00-22:00 | AVAILABLE |
| Cochera Jesús María 107 | Av. Salaverry 1074, Jesús María, Lima, Perú | -12.073897, -77.038230 | S/ 6.00 | 08:00-22:00 | AVAILABLE |
| Cochera La Molina 005 | Calle Los Fresnos 156, La Molina, Lima, Perú | -12.087237, -76.935274 | S/ 9.00 | 06:00-20:00 | AVAILABLE |
| Cochera La Molina 025 | Calle Los Fresnos 336, La Molina, Lima, Perú | -12.089452, -76.939897 | S/ 7.00 | 06:00-20:00 | AVAILABLE |
| Cochera La Molina 045 | Calle Los Fresnos 516, La Molina, Lima, Perú | -12.081073, -76.928113 | S/ 5.00 | 06:00-20:00 | OCCUPIED |
| Cochera La Molina 065 | Calle Los Fresnos 696, La Molina, Lima, Perú | -12.094005, -76.940050 | S/ 12.00 | 06:00-20:00 | AVAILABLE |
| Cochera La Molina 085 | Calle Los Fresnos 876, La Molina, Lima, Perú | -12.088626, -76.932273 | S/ 10.00 | 06:00-20:00 | RESERVED |
| Cochera La Molina 105 | Calle Los Fresnos 1056, La Molina, Lima, Perú | -12.079322, -76.942052 | S/ 8.00 | 06:00-20:00 | AVAILABLE |
| Cochera Lince 008 | Jr. Risso 183, Lince, Lima, Perú | -12.087776, -77.027437 | S/ 10.50 | 09:00-23:59 | RESERVED |
| Cochera Lince 028 | Jr. Risso 363, Lince, Lima, Perú | -12.090786, -77.025332 | S/ 8.50 | 09:00-23:59 | AVAILABLE |
| Cochera Lince 048 | Jr. Risso 543, Lince, Lima, Perú | -12.091134, -77.035182 | S/ 6.50 | 09:00-23:59 | AVAILABLE |
| Cochera Lince 068 | Jr. Risso 723, Lince, Lima, Perú | -12.086715, -77.035442 | S/ 4.50 | 09:00-23:59 | AVAILABLE |
| Cochera Lince 088 | Jr. Risso 903, Lince, Lima, Perú | -12.085705, -77.034476 | S/ 11.50 | 09:00-23:59 | AVAILABLE |
| Cochera Lince 108 | Jr. Risso 1083, Lince, Lima, Perú | -12.080796, -77.025423 | S/ 9.50 | 09:00-23:59 | AVAILABLE |
| Cochera Los Olivos 015 | Av. Naranjal 246, Los Olivos, Lima, Perú | -11.992847, -77.068766 | S/ 8.00 | 08:00-22:00 | RESERVED |
| Cochera Los Olivos 035 | Av. Naranjal 426, Los Olivos, Lima, Perú | -11.990433, -77.079558 | S/ 6.00 | 08:00-22:00 | DISABLED |
| Cochera Los Olivos 055 | Av. Naranjal 606, Los Olivos, Lima, Perú | -11.985088, -77.071662 | S/ 4.00 | 08:00-22:00 | AVAILABLE |
| Cochera Los Olivos 075 | Av. Naranjal 786, Los Olivos, Lima, Perú | -11.990092, -77.064589 | S/ 11.00 | 08:00-22:00 | AVAILABLE |
| Cochera Los Olivos 095 | Av. Naranjal 966, Los Olivos, Lima, Perú | -11.987280, -77.072384 | S/ 9.00 | 08:00-22:00 | AVAILABLE |
| Cochera Los Olivos 115 | Av. Naranjal 1146, Los Olivos, Lima, Perú | -11.992578, -77.073008 | S/ 7.00 | 08:00-22:00 | AVAILABLE |
| Cochera Magdalena del Mar 009 | Jr. Bolognesi 192, Magdalena del Mar, Lima, Perú | -12.090987, -77.068399 | S/ 5.00 | 06:00-20:00 | AVAILABLE |
| Cochera Magdalena del Mar 029 | Jr. Bolognesi 372, Magdalena del Mar, Lima, Perú | -12.093137, -77.061853 | S/ 12.00 | 06:00-20:00 | RESERVED |
| Cochera Magdalena del Mar 049 | Jr. Bolognesi 552, Magdalena del Mar, Lima, Perú | -12.098641, -77.074763 | S/ 10.00 | 06:00-20:00 | AVAILABLE |
| Cochera Magdalena del Mar 069 | Jr. Bolognesi 732, Magdalena del Mar, Lima, Perú | -12.094793, -77.064078 | S/ 8.00 | 06:00-20:00 | DISABLED |
| Cochera Magdalena del Mar 089 | Jr. Bolognesi 912, Magdalena del Mar, Lima, Perú | -12.083996, -77.059508 | S/ 6.00 | 06:00-20:00 | OCCUPIED |
| Cochera Magdalena del Mar 109 | Jr. Bolognesi 1092, Magdalena del Mar, Lima, Perú | -12.083688, -77.069613 | S/ 4.00 | 06:00-20:00 | AVAILABLE |
| Cochera Miraflores 001 | Av. José Larco 120, Miraflores, Lima, Perú | -12.113510, -77.025577 | S/ 4.00 | 06:00-20:00 | DISABLED |
| Cochera Miraflores 021 | Av. José Larco 300, Miraflores, Lima, Perú | -12.120091, -77.031573 | S/ 11.00 | 06:00-20:00 | AVAILABLE |
| Cochera Miraflores 041 | Av. José Larco 480, Miraflores, Lima, Perú | -12.113283, -77.022267 | S/ 9.00 | 06:00-20:00 | AVAILABLE |
| Cochera Miraflores 061 | Av. José Larco 660, Miraflores, Lima, Perú | -12.128620, -77.021544 | S/ 7.00 | 06:00-20:00 | AVAILABLE |
| Cochera Miraflores 081 | Av. José Larco 840, Miraflores, Lima, Perú | -12.122334, -77.024397 | S/ 5.00 | 06:00-20:00 | AVAILABLE |
| Cochera Miraflores 101 | Av. José Larco 1020, Miraflores, Lima, Perú | -12.113306, -77.028312 | S/ 12.00 | 06:00-20:00 | AVAILABLE |
| Cochera Pueblo Libre 010 | Av. Universitaria 201, Pueblo Libre, Lima, Perú | -12.067813, -77.064477 | S/ 8.50 | 07:00-21:00 | AVAILABLE |
| Cochera Pueblo Libre 030 | Av. Universitaria 381, Pueblo Libre, Lima, Perú | -12.067569, -77.056310 | S/ 6.50 | 07:00-21:00 | AVAILABLE |
| Cochera Pueblo Libre 050 | Av. Universitaria 561, Pueblo Libre, Lima, Perú | -12.079860, -77.058414 | S/ 4.50 | 07:00-21:00 | RESERVED |
| Cochera Pueblo Libre 070 | Av. Universitaria 741, Pueblo Libre, Lima, Perú | -12.078679, -77.058387 | S/ 11.50 | 07:00-21:00 | AVAILABLE |
| Cochera Pueblo Libre 090 | Av. Universitaria 921, Pueblo Libre, Lima, Perú | -12.070623, -77.057009 | S/ 9.50 | 07:00-21:00 | AVAILABLE |
| Cochera Pueblo Libre 110 | Av. Universitaria 1101, Pueblo Libre, Lima, Perú | -12.081553, -77.054465 | S/ 7.50 | 07:00-21:00 | AVAILABLE |
| Cochera San Borja 006 | Av. Aviación 165, San Borja, Lima, Perú | -12.106630, -77.015369 | S/ 12.50 | 07:00-21:00 | AVAILABLE |
| Cochera San Borja 026 | Av. Aviación 345, San Borja, Lima, Perú | -12.108984, -77.004986 | S/ 10.50 | 07:00-21:00 | AVAILABLE |
| Cochera San Borja 046 | Av. Aviación 525, San Borja, Lima, Perú | -12.112803, -77.001020 | S/ 8.50 | 07:00-21:00 | AVAILABLE |
| Cochera San Borja 066 | Av. Aviación 705, San Borja, Lima, Perú | -12.107143, -76.999791 | S/ 6.50 | 07:00-21:00 | AVAILABLE |
| Cochera San Borja 086 | Av. Aviación 885, San Borja, Lima, Perú | -12.109173, -77.001526 | S/ 4.50 | 07:00-21:00 | DISABLED |
| Cochera San Borja 106 | Av. Aviación 1065, San Borja, Lima, Perú | -12.111713, -77.001178 | S/ 11.50 | 07:00-21:00 | RESERVED |
| Cochera San Isidro 002 | Av. Camino Real 129, San Isidro, Lima, Perú | -12.105670, -77.035124 | S/ 7.50 | 07:00-21:00 | AVAILABLE |
| Cochera San Isidro 022 | Av. Camino Real 309, San Isidro, Lima, Perú | -12.094804, -77.039430 | S/ 5.50 | 07:00-21:00 | RESERVED |
| Cochera San Isidro 042 | Av. Camino Real 489, San Isidro, Lima, Perú | -12.098545, -77.044990 | S/ 12.50 | 07:00-21:00 | AVAILABLE |
| Cochera San Isidro 062 | Av. Camino Real 669, San Isidro, Lima, Perú | -12.092104, -77.037100 | S/ 10.50 | 07:00-21:00 | AVAILABLE |
| Cochera San Isidro 082 | Av. Camino Real 849, San Isidro, Lima, Perú | -12.105088, -77.044888 | S/ 8.50 | 07:00-21:00 | AVAILABLE |
| Cochera San Isidro 102 | Av. Camino Real 1029, San Isidro, Lima, Perú | -12.105279, -77.036683 | S/ 6.50 | 07:00-21:00 | AVAILABLE |
| Cochera San Juan de Miraflores 020 | Jr. Billinghurst 291, San Juan de Miraflores, Lima, Perú | -12.152313, -76.972523 | S/ 7.50 | 09:00-23:59 | AVAILABLE |
| Cochera San Juan de Miraflores 040 | Jr. Billinghurst 471, San Juan de Miraflores, Lima, Perú | -12.155260, -76.974853 | S/ 5.50 | 09:00-23:59 | AVAILABLE |
| Cochera San Juan de Miraflores 060 | Jr. Billinghurst 651, San Juan de Miraflores, Lima, Perú | -12.162943, -76.973552 | S/ 12.50 | 09:00-23:59 | AVAILABLE |
| Cochera San Juan de Miraflores 080 | Jr. Billinghurst 831, San Juan de Miraflores, Lima, Perú | -12.152790, -76.966449 | S/ 10.50 | 09:00-23:59 | AVAILABLE |
| Cochera San Juan de Miraflores 100 | Jr. Billinghurst 1011, San Juan de Miraflores, Lima, Perú | -12.161246, -76.967926 | S/ 8.50 | 09:00-23:59 | OCCUPIED |
| Cochera San Juan de Miraflores 120 | Jr. Billinghurst 1191, San Juan de Miraflores, Lima, Perú | -12.161177, -76.970854 | S/ 6.50 | 09:00-23:59 | DISABLED |
| Cochera San Martín de Porres 016 | Av. Perú 255, San Martín de Porres, Lima, Perú | -12.022616, -77.050170 | S/ 11.50 | 09:00-23:59 | AVAILABLE |
| Cochera San Martín de Porres 036 | Av. Perú 435, San Martín de Porres, Lima, Perú | -12.021633, -77.055465 | S/ 9.50 | 09:00-23:59 | RESERVED |
| Cochera San Martín de Porres 056 | Av. Perú 615, San Martín de Porres, Lima, Perú | -12.030756, -77.061628 | S/ 7.50 | 09:00-23:59 | OCCUPIED |
| Cochera San Martín de Porres 076 | Av. Perú 795, San Martín de Porres, Lima, Perú | -12.036526, -77.055649 | S/ 5.50 | 09:00-23:59 | AVAILABLE |
| Cochera San Martín de Porres 096 | Av. Perú 975, San Martín de Porres, Lima, Perú | -12.022597, -77.048459 | S/ 12.50 | 09:00-23:59 | AVAILABLE |
| Cochera San Martín de Porres 116 | Av. Perú 1155, San Martín de Porres, Lima, Perú | -12.030884, -77.057405 | S/ 10.50 | 09:00-23:59 | AVAILABLE |
| Cochera San Miguel 011 | Av. La Marina 210, San Miguel, Lima, Perú | -12.072119, -77.087608 | S/ 12.00 | 08:00-22:00 | AVAILABLE |
| Cochera San Miguel 031 | Av. La Marina 390, San Miguel, Lima, Perú | -12.073879, -77.089971 | S/ 10.00 | 08:00-22:00 | AVAILABLE |
| Cochera San Miguel 051 | Av. La Marina 570, San Miguel, Lima, Perú | -12.084814, -77.081240 | S/ 8.00 | 08:00-22:00 | AVAILABLE |
| Cochera San Miguel 071 | Av. La Marina 750, San Miguel, Lima, Perú | -12.077767, -77.077015 | S/ 6.00 | 08:00-22:00 | RESERVED |
| Cochera San Miguel 091 | Av. La Marina 930, San Miguel, Lima, Perú | -12.084354, -77.087440 | S/ 4.00 | 08:00-22:00 | AVAILABLE |
| Cochera San Miguel 111 | Av. La Marina 1110, San Miguel, Lima, Perú | -12.075358, -77.079685 | S/ 11.00 | 08:00-22:00 | OCCUPIED |
| Cochera Santa Anita 019 | Av. Colectora Industrial 282, Santa Anita, Lima, Perú | -12.046492, -76.968727 | S/ 4.00 | 08:00-22:00 | AVAILABLE |
| Cochera Santa Anita 039 | Av. Colectora Industrial 462, Santa Anita, Lima, Perú | -12.038472, -76.967412 | S/ 11.00 | 08:00-22:00 | AVAILABLE |
| Cochera Santa Anita 059 | Av. Colectora Industrial 642, Santa Anita, Lima, Perú | -12.049151, -76.977838 | S/ 9.00 | 08:00-22:00 | AVAILABLE |
| Cochera Santa Anita 079 | Av. Colectora Industrial 822, Santa Anita, Lima, Perú | -12.051505, -76.971416 | S/ 7.00 | 08:00-22:00 | AVAILABLE |
| Cochera Santa Anita 099 | Av. Colectora Industrial 1002, Santa Anita, Lima, Perú | -12.043481, -76.962662 | S/ 5.00 | 08:00-22:00 | RESERVED |
| Cochera Santa Anita 119 | Av. Colectora Industrial 1182, Santa Anita, Lima, Perú | -12.034388, -76.978702 | S/ 12.00 | 08:00-22:00 | AVAILABLE |
| Cochera Santiago de Surco 004 | Av. Encalada 147, Santiago de Surco, Lima, Perú | -12.137073, -76.992166 | S/ 5.50 | 09:00-23:59 | AVAILABLE |
| Cochera Santiago de Surco 024 | Av. Encalada 327, Santiago de Surco, Lima, Perú | -12.141356, -76.999763 | S/ 12.50 | 09:00-23:59 | AVAILABLE |
| Cochera Santiago de Surco 044 | Av. Encalada 507, Santiago de Surco, Lima, Perú | -12.131295, -76.986956 | S/ 10.50 | 09:00-23:59 | AVAILABLE |
| Cochera Santiago de Surco 064 | Av. Encalada 687, Santiago de Surco, Lima, Perú | -12.142215, -76.983851 | S/ 8.50 | 09:00-23:59 | RESERVED |
| Cochera Santiago de Surco 084 | Av. Encalada 867, Santiago de Surco, Lima, Perú | -12.142107, -76.984280 | S/ 6.50 | 09:00-23:59 | AVAILABLE |
| Cochera Santiago de Surco 104 | Av. Encalada 1047, Santiago de Surco, Lima, Perú | -12.134844, -76.995403 | S/ 4.50 | 09:00-23:59 | AVAILABLE |
| Cochera Surquillo 013 | Av. República de Panamá 228, Surquillo, Lima, Perú | -12.102687, -77.014000 | S/ 10.00 | 06:00-20:00 | AVAILABLE |
| Cochera Surquillo 033 | Av. República de Panamá 408, Surquillo, Lima, Perú | -12.113075, -77.025327 | S/ 8.00 | 06:00-20:00 | AVAILABLE |
| Cochera Surquillo 053 | Av. República de Panamá 588, Surquillo, Lima, Perú | -12.110630, -77.017225 | S/ 6.00 | 06:00-20:00 | AVAILABLE |
| Cochera Surquillo 073 | Av. República de Panamá 768, Surquillo, Lima, Perú | -12.120080, -77.015454 | S/ 4.00 | 06:00-20:00 | AVAILABLE |
| Cochera Surquillo 093 | Av. República de Panamá 948, Surquillo, Lima, Perú | -12.107327, -77.018563 | S/ 11.00 | 06:00-20:00 | AVAILABLE |
| Cochera Surquillo 113 | Av. República de Panamá 1128, Surquillo, Lima, Perú | -12.120033, -77.013399 | S/ 9.00 | 06:00-20:00 | RESERVED |

## 6. Primeras 40 reservas creadas

> Se crearon 160 reservas en total. Esta tabla lista las primeras 40 para validación rápida.

| Código | Driver | Estacionamiento | Inicio | Fin | Total | Estado |
|---|---|---|---|---|---:|---|
| PKL-LIM-00001 | driver01@parklink.test | Cochera Ate 018 | 2026-06-23 06:22 | 2026-06-23 07:22 | S/ 9.50 | CANCELLED |
| PKL-LIM-00002 | driver02@parklink.test | Cochera Ate 078 | 2026-06-23 13:22 | 2026-06-23 15:22 | S/ 25.00 | CONFIRMED |
| PKL-LIM-00003 | driver03@parklink.test | Cochera Barranco 003 | 2026-06-24 14:22 | 2026-06-24 17:22 | S/ 33.00 | CONFIRMED |
| PKL-LIM-00004 | driver04@parklink.test | Cochera Barranco 063 | 2026-06-25 15:22 | 2026-06-25 19:22 | S/ 20.00 | PENDING_PAYMENT |
| PKL-LIM-00005 | driver05@parklink.test | Cochera Cercado de Lima 012 | 2026-06-26 16:22 | 2026-06-26 17:22 | S/ 6.50 | CONFIRMED |
| PKL-LIM-00006 | driver06@parklink.test | Cochera Cercado de Lima 072 | 2026-06-15 06:22 | 2026-06-15 08:22 | S/ 19.00 | COMPLETED |
| PKL-LIM-00007 | driver07@parklink.test | Cochera Chorrillos 014 | 2026-06-28 18:22 | 2026-06-28 21:22 | S/ 13.50 | PENDING_PAYMENT |
| PKL-LIM-00008 | driver08@parklink.test | Cochera Chorrillos 074 | 2026-06-22 05:52 | 2026-06-22 08:22 | S/ 22.50 | ACTIVE |
| PKL-LIM-00009 | driver09@parklink.test | Cochera Independencia 017 | 2026-06-30 20:22 | 2026-06-30 21:22 | S/ 6.00 | CONFIRMED |
| PKL-LIM-00010 | driver10@parklink.test | Cochera Independencia 077 | 2026-07-01 21:22 | 2026-07-01 23:22 | S/ 18.00 | PENDING_PAYMENT |
| PKL-LIM-00011 | driver11@parklink.test | Cochera Jesús María 007 | 2026-06-10 06:22 | 2026-06-10 09:22 | S/ 21.00 | COMPLETED |
| PKL-LIM-00012 | driver12@parklink.test | Cochera Jesús María 067 | 2026-07-03 23:22 | 2026-07-04 03:22 | S/ 40.00 | CONFIRMED |
| PKL-LIM-00013 | driver13@parklink.test | Cochera La Molina 005 | 2026-07-04 12:22 | 2026-07-04 13:22 | S/ 9.00 | PENDING_PAYMENT |
| PKL-LIM-00014 | driver14@parklink.test | Cochera La Molina 065 | 2026-07-06 11:22 | 2026-07-06 13:22 | S/ 24.00 | CANCELLED |
| PKL-LIM-00015 | driver15@parklink.test | Cochera Lince 008 | 2026-06-22 05:52 | 2026-06-22 08:52 | S/ 31.50 | ACTIVE |
| PKL-LIM-00016 | driver16@parklink.test | Cochera Lince 068 | 2026-06-19 06:22 | 2026-06-19 10:22 | S/ 18.00 | COMPLETED |
| PKL-LIM-00017 | driver17@parklink.test | Cochera Los Olivos 015 | 2026-07-08 16:22 | 2026-07-08 17:22 | S/ 8.00 | CONFIRMED |
| PKL-LIM-00018 | driver18@parklink.test | Cochera Los Olivos 075 | 2026-07-09 17:22 | 2026-07-09 19:22 | S/ 22.00 | CONFIRMED |
| PKL-LIM-00019 | driver19@parklink.test | Cochera Magdalena del Mar 009 | 2026-07-10 18:22 | 2026-07-10 21:22 | S/ 15.00 | PENDING_PAYMENT |
| PKL-LIM-00020 | driver20@parklink.test | Cochera Magdalena del Mar 069 | 2026-07-11 19:22 | 2026-07-11 23:22 | S/ 32.00 | CONFIRMED |
| PKL-LIM-00021 | driver21@parklink.test | Cochera Miraflores 001 | 2026-06-14 06:22 | 2026-06-14 07:22 | S/ 4.00 | COMPLETED |
| PKL-LIM-00022 | driver22@parklink.test | Cochera Miraflores 061 | 2026-06-22 05:52 | 2026-06-22 07:52 | S/ 14.00 | ACTIVE |
| PKL-LIM-00023 | driver23@parklink.test | Cochera Pueblo Libre 010 | 2026-07-14 22:22 | 2026-07-15 01:22 | S/ 25.50 | CONFIRMED |
| PKL-LIM-00024 | driver24@parklink.test | Cochera Pueblo Libre 070 | 2026-07-15 23:22 | 2026-07-16 03:22 | S/ 46.00 | CONFIRMED |
| PKL-LIM-00025 | driver25@parklink.test | Cochera San Borja 006 | 2026-07-16 12:22 | 2026-07-16 13:22 | S/ 12.50 | PENDING_PAYMENT |
| PKL-LIM-00026 | driver26@parklink.test | Cochera San Borja 066 | 2026-06-09 06:22 | 2026-06-09 08:22 | S/ 13.00 | COMPLETED |
| PKL-LIM-00027 | driver27@parklink.test | Cochera San Isidro 002 | 2026-06-29 08:22 | 2026-06-29 11:22 | S/ 22.50 | CANCELLED |
| PKL-LIM-00028 | driver28@parklink.test | Cochera San Isidro 062 | 2026-07-19 15:22 | 2026-07-19 19:22 | S/ 42.00 | PENDING_PAYMENT |
| PKL-LIM-00029 | driver29@parklink.test | Cochera San Juan de Miraflores 020 | 2026-06-22 05:52 | 2026-06-22 08:22 | S/ 22.50 | ACTIVE |
| PKL-LIM-00030 | driver30@parklink.test | Cochera San Juan de Miraflores 080 | 2026-07-21 17:22 | 2026-07-21 19:22 | S/ 21.00 | CONFIRMED |
| PKL-LIM-00031 | driver31@parklink.test | Cochera San Martín de Porres 016 | 2026-06-18 06:22 | 2026-06-18 09:22 | S/ 34.50 | COMPLETED |
| PKL-LIM-00032 | driver32@parklink.test | Cochera San Martín de Porres 076 | 2026-06-23 19:22 | 2026-06-23 23:22 | S/ 22.00 | CONFIRMED |
| PKL-LIM-00033 | driver33@parklink.test | Cochera San Miguel 011 | 2026-06-24 20:22 | 2026-06-24 21:22 | S/ 12.00 | CONFIRMED |
| PKL-LIM-00034 | driver34@parklink.test | Cochera San Miguel 071 | 2026-06-25 21:22 | 2026-06-25 23:22 | S/ 12.00 | PENDING_PAYMENT |
| PKL-LIM-00035 | driver35@parklink.test | Cochera Santa Anita 019 | 2026-06-26 22:22 | 2026-06-27 01:22 | S/ 12.00 | CONFIRMED |
| PKL-LIM-00036 | driver36@parklink.test | Cochera Santa Anita 079 | 2026-06-22 05:52 | 2026-06-22 08:52 | S/ 21.00 | ACTIVE |
| PKL-LIM-00037 | driver37@parklink.test | Cochera Santiago de Surco 004 | 2026-06-28 12:22 | 2026-06-28 13:22 | S/ 5.50 | PENDING_PAYMENT |
| PKL-LIM-00038 | driver38@parklink.test | Cochera Santiago de Surco 064 | 2026-06-29 13:22 | 2026-06-29 15:22 | S/ 17.00 | CONFIRMED |
| PKL-LIM-00039 | driver39@parklink.test | Cochera Surquillo 013 | 2026-06-30 14:22 | 2026-06-30 17:22 | S/ 30.00 | CONFIRMED |
| PKL-LIM-00040 | driver40@parklink.test | Cochera Surquillo 073 | 2026-07-12 13:22 | 2026-07-12 14:22 | S/ 4.00 | CANCELLED |

## 7. Cuentas rápidas para pruebas

| Caso | Email | Password |
|---|---|---|
| Admin | `admin@parklink.test` | `ParkLink2026!` |
| Dueño / owner | `owner01@parklink.test` | `ParkLink2026!` |
| Conductor / driver | `driver01@parklink.test` | `ParkLink2026!` |
| Conductor alternativo | `driver25@parklink.test` | `ParkLink2026!` |

## 8. Notas

- Todas las direcciones y coordenadas pertenecen a Lima Metropolitana, Perú.
- Los pagos son datos mock y siguen el modelo actual del backend.
- Las contraseñas están hasheadas con bcrypt en la base de datos.
- El plan Free de Render expira el 2026-07-22T06:12:23.266964Z y puede pausarse o tener cold starts.
