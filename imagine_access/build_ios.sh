#!/bin/bash

# ==========================================
# SCRIPT DE BUILD PARA iOS - IMAGINE ACCESS
# ==========================================
# Uso: ./build_ios.sh [debug|release|appstore]

set -e  # Detener en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Tipo de build (por defecto release)
BUILD_TYPE=${1:-release}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           IMAGINE ACCESS - iOS BUILD SCRIPT                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "pubspec.yaml" ]; then
    echo -e "${RED}❌ Error: No se encontró pubspec.yaml${NC}"
    echo "Ejecuta este script desde la raíz del proyecto imagine_access"
    exit 1
fi

echo -e "${BLUE}📋 Build type: ${BUILD_TYPE}${NC}\n"

# ==========================================
# PASO 1: LIMPIEZA
# ==========================================
echo -e "${YELLOW}🧹 Limpiando proyecto...${NC}"
flutter clean > /dev/null 2>&1
echo -e "${GREEN}✓ Limpieza completada${NC}\n"

# ==========================================
# PASO 2: INSTALAR DEPENDENCIAS
# ==========================================
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
flutter pub get
echo -e "${GREEN}✓ Dependencias instaladas${NC}\n"

# ==========================================
# PASO 3: VERIFICAR ARCHIVO .env
# ==========================================
if [ ! -f ".env" ]; then
    echo -e "${RED}⚠️  Advertencia: No se encontró archivo .env${NC}"
    echo -e "${YELLOW}Por favor crea un archivo .env con tus credenciales de Supabase${NC}"
    echo "Puedes copiar de .env.production como plantilla"
    echo ""
    read -p "¿Continuar de todos modos? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ==========================================
# PASO 4: GENERAR ARCHIVOS NATIVOS
# ==========================================
echo -e "${YELLOW}🔧 Generando archivos de plataforma...${NC}"
flutter precache --ios > /dev/null 2>&1
echo -e "${GREEN}✓ Archivos de plataforma generados${NC}\n"

# ==========================================
# PASO 5: INSTALAR PODS
# ==========================================
echo -e "${YELLOW}🍎 Instalando CocoaPods...${NC}"
cd ios

# Detectar arquitectura (M1/M2 vs Intel)
if [[ $(uname -m) == "arm64" ]]; then
    echo "   Detectado: Apple Silicon (M1/M2/M3)"
    arch -arm64 pod install --repo-update
else
    echo "   Detectado: Intel Mac"
    pod install --repo-update
fi

cd ..
echo -e "${GREEN}✓ Pods instalados${NC}\n"

# ==========================================
# PASO 6: ANÁLISIS ESTÁTICO
# ==========================================
echo -e "${YELLOW}🔍 Analizando código...${NC}"
if ! flutter analyze --no-pub; then
    echo -e "${RED}⚠️  Se encontraron problemas en el análisis${NC}"
    read -p "¿Continuar de todos modos? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo -e "${GREEN}✓ Análisis completado${NC}\n"

# ==========================================
# PASO 7: BUILD iOS
# ==========================================
case $BUILD_TYPE in
    "debug")
        echo -e "${YELLOW}🏗️  Construyendo app iOS (Debug)...${NC}"
        flutter build ios --debug
        ;;
    "release")
        echo -e "${YELLOW}🏗️  Construyendo app iOS (Release)...${NC}"
        flutter build ios --release
        ;;
    "appstore")
        echo -e "${YELLOW}🏗️  Construyendo app iOS para App Store...${NC}"
        flutter build ipa --export-method=app-store
        ;;
    *)
        echo -e "${RED}❌ Tipo de build no válido: $BUILD_TYPE${NC}"
        echo "Uso: ./build_ios.sh [debug|release|appstore]"
        exit 1
        ;;
esac

# ==========================================
# RESULTADO
# ==========================================
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✅ BUILD COMPLETADO EXITOSAMENTE               ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    case $BUILD_TYPE in
        "debug")
            echo -e "${BLUE}📱 App de debug generada en:${NC}"
            echo "   build/ios/iphonesimulator/Runner.app"
            echo ""
            echo -e "${YELLOW}Para correr en simulador:${NC}"
            echo "   flutter run"
            ;;
        "release")
            echo -e "${BLUE}📱 App de release generada en:${NC}"
            echo "   build/ios/iphoneos/Runner.app"
            echo ""
            echo -e "${YELLOW}Próximos pasos:${NC}"
            echo "   1. Abre ios/Runner.xcworkspace en Xcode"
            echo "   2. Selecciona tu dispositivo físico"
            echo "   3. Ve a Product > Archive"
            echo "   4. Distribuye con App Store Connect"
            ;;
        "appstore")
            IPA_PATH="build/ios/ipa/Imagine Access.ipa"
            echo -e "${BLUE}📦 IPA generado en:${NC}"
            echo "   $IPA_PATH"
            echo ""
            echo -e "${YELLOW}Para subir a App Store:${NC}"
            echo "   1. Usa Transporter app desde la Mac App Store"
            echo "   2. O usa Xcode: Window > Organizer > Distribute App"
            ;;
    esac
    
    echo ""
    echo -e "${GREEN}🎉 ¡Listo para iOS!${NC}"
    
else
    echo ""
    echo -e "${RED}❌ BUILD FALLIDO${NC}"
    echo "Revisa los errores arriba"
    exit 1
fi
