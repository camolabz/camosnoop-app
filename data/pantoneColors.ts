export interface PantoneColor {
  code: string;
  name: string;
  hex: string;
}

// A more comprehensive subset of Pantone Coated colors
export const PANTONE_COLORS: PantoneColor[] = [
  // Yellows
  { code: "PMS 100 C", name: "Yellow", hex: "#F6E200" },
  { code: "PMS 102 C", name: "Yellow", hex: "#FCE300" },
  { code: "PMS 107 C", name: "Yellow", hex: "#F9E526" },
  { code: "PMS 108 C", name: "Yellow", hex: "#FEDB00" },
  { code: "PMS 109 C", name: "Yellow", hex: "#FFD100" },
  { code: "PMS 113 C", name: "Yellow", hex: "#FBD760" },
  { code: "PMS 116 C", name: "Yellow", hex: "#FFCD00" },
  { code: "PMS 123 C", name: "Yellow", hex: "#FFC72C" },
  { code: "PMS 130 C", name: "Yellow-Orange", hex: "#F2A900" },
  { code: "PMS 3955 C", name: "Neon Yellow", hex: "#F3F315" },
  { code: "PMS 7405 C", name: "Muted Yellow", hex: "#E2B73E" },
  
  // Oranges
  { code: "PMS 137 C", name: "Orange", hex: "#FFA300" },
  { code: "PMS 144 C", name: "Orange", hex: "#ED8B00" },
  { code: "PMS 151 C", name: "Orange", hex: "#FF8200" },
  { code: "PMS 158 C", name: "Orange", hex: "#E87722" },
  { code: "PMS 165 C", name: "Orange", hex: "#FF671F" },
  { code: "PMS 1665 C", name: "Orange", hex: "#DC4405" },
  { code: "PMS 172 C", name: "Red-Orange", hex: "#FA4616" },
  { code: "PMS 716 C", name: "Bright Orange", hex: "#EA7600" },
  
  // Reds
  { code: "PMS 179 C", name: "Red", hex: "#E03C31" },
  { code: "PMS 1788 C", name: "Red", hex: "#EE2737" },
  { code: "PMS 185 C", name: "Red", hex: "#E4002B" },
  { code: "PMS 186 C", name: "Red", hex: "#C8102E" },
  { code: "PMS 199 C", name: "Red", hex: "#D50032" },
  { code: "PMS 200 C", name: "Red", hex: "#BA0C2F" },
  { code: "PMS 201 C", name: "Red", hex: "#9D2235" },
  { code: "PMS 202 C", name: "Dark Red", hex: "#862633" },
  { code: "PMS 485 C", name: "Red", hex: "#DA291C" },
  { code: "PMS 703 C", name: "Pastel Red", hex: "#A64B4F" },
  { code: "PMS 7621 C", name: "Brick Red", hex: "#AB2328" },

  // Pinks / Magentas
  { code: "PMS 212 C", name: "Pink", hex: "#F55274" },
  { code: "PMS 219 C", name: "Rubine Red", hex: "#DA1884" },
  { code: "PMS 226 C", name: "Magenta", hex: "#D70075" },
  { code: "PMS 232 C", name: "Rhodamine Red", hex: "#EE3C96" },
  { code: "PMS Process Magenta C", name: "Magenta", hex: "#EC008C" },
  { code: "PMS 707 C", name: "Light Pink", hex: "#F9A3A9" },
  { code: "PMS 7425 C", name: "Deep Pink", hex: "#B04A6C" },

  // Purples
  { code: "PMS 239 C", name: "Purple", hex: "#D8248E" },
  { code: "PMS 259 C", name: "Purple", hex: "#6D2077" },
  { code: "PMS 266 C", name: "Purple", hex: "#753BBD" },
  { code: "PMS 268 C", name: "Purple", hex: "#582C83" },
  { code: "PMS 273 C", name: "Purple", hex: "#38215B" },
  { code: "PMS 513 C", name: "Violet", hex: "#94459A" },
  { code: "PMS 7671 C", name: "Indigo Purple", hex: "#5B4F95" },

  // Blues
  { code: "PMS 280 C", name: "Navy Blue", hex: "#012169" },
  { code: "PMS 286 C", name: "Royal Blue", hex: "#0033A0" },
  { code: "PMS 293 C", name: "Blue", hex: "#003DA5" },
  { code: "PMS 299 C", name: "Sky Blue", hex: "#00A3E0" },
  { code: "PMS 300 C", name: "Blue", hex: "#005EB8" },
  { code: "PMS 306 C", name: "Process Blue", hex: "#00B5E2" },
  { code: "PMS 312 C", name: "Blue", hex: "#009CDE" },
  { code: "PMS 533 C", name: "Navy", hex: "#1F2A44" },
  { code: "PMS 541 C", name: "Blue", hex: "#003C71" },
  { code: "PMS 647 C", name: "Blue", hex: "#22557F" },
  { code: "PMS 279 C", name: "Cornflower", hex: "#418FDE" },
  { code: "PMS 7455 C", name: "Periwinkle", hex: "#455898" },
  { code: "PMS Process Cyan C", name: "Cyan", hex: "#009EE3" },

  // Teals / Aquas
  { code: "PMS 320 C", name: "Teal", hex: "#009DA5" },
  { code: "PMS 327 C", name: "Teal", hex: "#00857D" },
  { code: "PMS 3258 C", name: "Mint", hex: "#49C5B1" },
  { code: "PMS 7710 C", name: "Dark Teal", hex: "#00857D" },

  // Greens
  { code: "PMS 347 C", name: "Green", hex: "#009A44" },
  { code: "PMS 354 C", name: "Bright Green", hex: "#00B140" },
  { code: "PMS 361 C", name: "Green", hex: "#43B02A" },
  { code: "PMS 368 C", name: "Lime Green", hex: "#78BE20" },
  { code: "PMS 375 C", name: "Green", hex: "#97D700" },
  { code: "PMS 382 C", name: "Yellow-Green", hex: "#BAD80A" },
  { code: "PMS 340 C", name: "Teal Green", hex: "#00965E" },
  { code: "PMS 342 C", name: "Forest Green", hex: "#006A4E" },
  { code: "PMS 350 C", name: "Deep Green", hex: "#2C5234" },
  { code: "PMS 7482 C", name: "Light Green", hex: "#00AD5F" },
  { code: "PMS 7488 C", name: "Grass Green", hex: "#6CC24A" },
  { code: "PMS 7738 C", name: "Dark Forest", hex: "#1A4B2D" },
  { code: "PMS 357 C", name: "Olive Drab", hex: "#21412D" },
  { code: "PMS 575 C", name: "Olive", hex: "#67823A" },
  { code: "PMS 583 C", name: "Chartreuse", hex: "#A2B025" },
  { code: "PMS 555 C", name: "Dark Green", hex: "#206C49" },
  
  // Browns / Tans / Earth
  { code: "PMS 448 C", name: "Drab", hex: "#4A412A" },
  { code: "PMS 469 C", name: "Brown", hex: "#623412" },
  { code: "PMS 476 C", name: "Dark Brown", hex: "#4E3629" },
  { code: "PMS 729 C", name: "Tan", hex: "#BFA07A" },
  { code: "PMS 7502 C", name: "Beige", hex: "#CEB888" },
  { code: "PMS 7532 C", name: "Taupe", hex: "#5B4C3A" },
  { code: "PMS 4625 C", name: "Espresso", hex: "#4F2C1D" },

  // Grays / Blacks / Metallics
  { code: "PMS 420 C", name: "Light Gray", hex: "#C7C9C7" },
  { code: "PMS 421 C", name: "Gray", hex: "#B2B4B2" },
  { code: "PMS 424 C", name: "Gray", hex: "#707372" },
  { code: "PMS 425 C", name: "Dark Gray", hex: "#54585A" },
  { code: "PMS Cool Gray 1 C", name: "Cool Gray", hex: "#D9D9D6" },
  { code: "PMS Cool Gray 5 C", name: "Cool Gray", hex: "#B1B3B3" },
  { code: "PMS Cool Gray 11 C", name: "Cool Gray", hex: "#53565A" },
  { code: "PMS Warm Gray 1 C", name: "Warm Gray", hex: "#D7D2CB" },
  { code: "PMS Warm Gray 5 C", name: "Warm Gray", hex: "#ACA39A" },
  { code: "PMS Warm Gray 11 C", name: "Warm Gray", hex: "#6E6259" },
  { code: "PMS Process Black C", name: "Black", hex: "#2E2925" },
  { code: "PMS Black 6 C", name: "Black", hex: "#101820" },
  { code: "PMS 871 C", name: "Gold", hex: "#84754E" },
  { code: "PMS 877 C", name: "Silver", hex: "#8A8D8F" },
  
  // More specific shades
  { code: "PMS 5625 C", name: "Sage", hex: "#6E8574" },
  { code: "PMS 7545 C", name: "Slate", hex: "#425563" },
  { code: "PMS 7605 C", name: "Sand", hex: "#D6C4B1" },
  { code: "PMS 2001 C", name: "Neon Orange", hex: "#FFA35F" },
];
