#!/bin/bash

# ProLeadsAI WordPress Plugin Release Script
# Usage: ./scripts/release.sh [version]
# Example: ./scripts/release.sh 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory and plugin root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"
PLUGIN_NAME="proleadsai"
BUILD_DIR="$PLUGIN_DIR/build"
DIST_DIR="$PLUGIN_DIR/dist"

# Get version from argument or package.json
VERSION=${1:-$(node -p "require('./package.json').version" 2>/dev/null || echo "1.0.0")}

echo -e "${GREEN}🚀 Building ProLeadsAI WordPress Plugin v${VERSION}${NC}"
echo ""

# Step 1: Clean previous builds
echo -e "${YELLOW}📦 Cleaning previous builds...${NC}"
rm -rf "$BUILD_DIR" "$DIST_DIR"
mkdir -p "$BUILD_DIR/$PLUGIN_NAME" "$DIST_DIR"

# Step 2: Install dependencies
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
cd "$PLUGIN_DIR"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Step 3: Build admin assets (Vite)
echo -e "${YELLOW}🔨 Building admin assets...${NC}"
pnpm build

# Step 4: Build custom element widget (from sibling project)
WIDGET_DIR="$PLUGIN_DIR/../proleadsai-custom-element"
if [ -d "$WIDGET_DIR" ]; then
  echo -e "${YELLOW}🔨 Building widget custom element...${NC}"
  cd "$WIDGET_DIR"
  pnpm install --frozen-lockfile 2>/dev/null || pnpm install
  pnpm build
  
  # Copy widget files to plugin
  cp "$WIDGET_DIR/dist/proleadsai-widget.iife.js" "$PLUGIN_DIR/public/js/proleadsai-widget-ce.js"
  cp "$WIDGET_DIR/dist/proleadsai-widget.css" "$PLUGIN_DIR/public/css/proleadsai-widget.css"
  cd "$PLUGIN_DIR"
else
  echo -e "${RED}⚠️  Widget project not found at $WIDGET_DIR${NC}"
  echo -e "${YELLOW}   Skipping widget build. Make sure public/js/proleadsai-widget-ce.js exists.${NC}"
fi

# Step 5: Copy plugin files to build directory
echo -e "${YELLOW}📋 Copying plugin files...${NC}"

# Core PHP files
cp "$PLUGIN_DIR/proleadsai.php" "$BUILD_DIR/$PLUGIN_NAME/"
cp "$PLUGIN_DIR/uninstall.php" "$BUILD_DIR/$PLUGIN_NAME/"
cp "$PLUGIN_DIR/index.php" "$BUILD_DIR/$PLUGIN_NAME/"
cp "$PLUGIN_DIR/readme.txt" "$BUILD_DIR/$PLUGIN_NAME/"
cp "$PLUGIN_DIR/license.txt" "$BUILD_DIR/$PLUGIN_NAME/"

# Includes
cp -r "$PLUGIN_DIR/includes" "$BUILD_DIR/$PLUGIN_NAME/"

# Admin (class + built assets)
mkdir -p "$BUILD_DIR/$PLUGIN_NAME/admin"
cp "$PLUGIN_DIR/admin/class-proleadsai-admin.php" "$BUILD_DIR/$PLUGIN_NAME/admin/"
cp "$PLUGIN_DIR/admin/index.php" "$BUILD_DIR/$PLUGIN_NAME/admin/"
cp -r "$PLUGIN_DIR/admin/dist" "$BUILD_DIR/$PLUGIN_NAME/admin/"
# Remove backup file that shouldn't be included
rm -f "$BUILD_DIR/$PLUGIN_NAME/admin/dist/class-proleadsai-public.php"
# Public
mkdir -p "$BUILD_DIR/$PLUGIN_NAME/public/js" "$BUILD_DIR/$PLUGIN_NAME/public/css"
cp "$PLUGIN_DIR/public/class-proleadsai-public.php" "$BUILD_DIR/$PLUGIN_NAME/public/"
cp "$PLUGIN_DIR/public/index.php" "$BUILD_DIR/$PLUGIN_NAME/public/"
cp "$PLUGIN_DIR/public/js/proleadsai-widget-ce.js" "$BUILD_DIR/$PLUGIN_NAME/public/js/"
cp "$PLUGIN_DIR/public/js/proleadsai-widget-launcher.js" "$BUILD_DIR/$PLUGIN_NAME/public/js/"
cp "$PLUGIN_DIR/public/css/proleadsai-widget.css" "$BUILD_DIR/$PLUGIN_NAME/public/css/"

# Languages
if [ -d "$PLUGIN_DIR/languages" ]; then
  cp -r "$PLUGIN_DIR/languages" "$BUILD_DIR/$PLUGIN_NAME/"
fi

# Step 6: Update version in plugin header
echo -e "${YELLOW}📝 Updating version to ${VERSION}...${NC}"
sed -i '' "s/Version:.*$/Version:           ${VERSION}/" "$BUILD_DIR/$PLUGIN_NAME/proleadsai.php"
sed -i '' "s/Stable tag:.*$/Stable tag: ${VERSION}/" "$BUILD_DIR/$PLUGIN_NAME/readme.txt"

# Step 7: Create ZIP
echo -e "${YELLOW}📦 Creating release ZIP...${NC}"
cd "$BUILD_DIR"
zip -r "$DIST_DIR/$PLUGIN_NAME-${VERSION}.zip" "$PLUGIN_NAME" -x "*.DS_Store" -x "*__MACOSX*"

# Also create a latest.zip for convenience
cp "$DIST_DIR/$PLUGIN_NAME-${VERSION}.zip" "$DIST_DIR/$PLUGIN_NAME-latest.zip"

# Step 8: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -rf "$BUILD_DIR"

# Done!
echo ""
echo -e "${GREEN}✅ Release build complete!${NC}"
echo ""
echo -e "   ${GREEN}📦 $DIST_DIR/$PLUGIN_NAME-${VERSION}.zip${NC}"
echo -e "   ${GREEN}📦 $DIST_DIR/$PLUGIN_NAME-latest.zip${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test the ZIP by installing in a fresh WordPress"
echo "  2. Create a GitHub release and attach the ZIP"
echo "  3. Tag the release: git tag v${VERSION} && git push origin v${VERSION}"
echo ""
