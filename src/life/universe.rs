use super::essentials::Cell;
use super::essentials::CellFormFactor;
use super::essentials::LifeRules;

use js_sys::Math;

use super::utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Universe {
    rules: LifeRules,
    wdim: u32,
    hdim: u32,
    cells: Vec<Cell>,
    cell_form_factor: CellFormFactor,
    tick: u32,
}

#[wasm_bindgen]
impl Universe {
    pub fn new(born: &str, survives: &str, w: u32, h: u32, cell_form_factor: CellFormFactor) -> Self {
        utils::set_panic_hook();

        let cells = Self::create_cells(w, h);

        Universe {
            rules: LifeRules::new(
                born.chars().map(|c| c.to_digit(10).unwrap() as u8).collect(), 
                survives.chars().map(|c| c.to_digit(10).unwrap() as u8).collect()
            ),
            wdim: w,
            hdim: h,
            cells,
            cell_form_factor,
            tick: 0
        }
    }

    fn create_cells(w: u32, h: u32) -> Vec<Cell> {
        return (0..w * h)
                    .map(|_i| {
                        if Math::random() < 0.7 { Cell::Alive }
                        else { Cell::Dead }
                    })
                    .collect();
    }

    pub fn restart(&mut self, born: &str, survives: &str, w: u32, h: u32, cell_form_factor: CellFormFactor) -> () {
        self.clear_universe();

        self.rules = LifeRules::new(
            born.chars().map(|c| c.to_digit(10).unwrap() as u8).collect(), 
            survives.chars().map(|c| c.to_digit(10).unwrap() as u8).collect()
        );

        self.wdim = w;
        self.hdim = h;
        self.cell_form_factor = cell_form_factor;

        self.cells = Self::create_cells(w, h);
        self.tick = 0;
    }

    pub fn tick(&mut self) -> u32 {
        let _timer = utils::Timer::new("Universe.tick");

        let mut next = self.cells.clone();

        for h in 0..self.hdim {
            for w in 0..self.wdim {
                let idx = self.get_index(w, h);
                let cell = self.cells[idx];
                let live_neighbours = self.live_neighbour_count(w, h);

                //log!("cell[{}, {}] is initially {:?} and has {} live neighbors", w, h, cell, live_neighbours);

                let next_cell_state = match (cell, live_neighbours) {
                    // Rule 1: Any live cell without specific live neighbours number around
                    // dies, as if caused by underpopulation or overpopulation.
                    (Cell::Alive, x) if !self.rules.get_survives().contains(&x) => Cell::Dead,
                    // Rule 2: Any live cell with specific live neighbours
                    // lives on to the next generation.
                    (Cell::Alive, x) if self.rules.get_survives().contains(&x) => Cell::Alive,
                    // Rule 3: Any dead cell with exactly three live neighbours
                    // becomes a live cell, as if by reproduction.
                    (Cell::Dead, x) if self.rules.get_born().contains(&x) => Cell::Alive,
                    // All other cells remain in the same state.
                    (otherwise, _) => otherwise, 
                };

                //log!("    it becomes {:?}", next_cell_state);

                next[idx] = next_cell_state;
            }
        }

        self.cells = next;

        self.tick = self.tick + 1;
        return self.tick;
    }

    pub fn render_to_string(&self) -> String { self.to_string() }

    pub fn width(&self) -> u32 { self.wdim }
    pub fn set_width(&mut self, w: u32) -> () { self.wdim = w; }

    pub fn height(&self) -> u32 { self.hdim }
    pub fn set_height(&mut self, h: u32) -> () { self.hdim = h; }

    pub fn cells(&self) -> *const Cell { self.cells.as_ptr() }

    pub fn cell_toggle(&mut self, w: u32, h: u32) -> Cell {
        let idx = self.get_index(w, h);
        self.cells[idx].toggle();

        return self.cells[idx];
    }

    pub fn born_rules(&self) -> String { self.rules.get_born().iter().map(|br| br.to_string()).collect() }
    pub fn survives_rules(&self) -> String { self.rules.get_survives().iter().map(|sr| sr.to_string()).collect() }

    pub fn set_rules(&mut self, born: &str, survives: &str) -> () {
        self.rules = LifeRules::new(
            born.chars().map(|c| c.to_digit(10).unwrap() as u8).collect(), 
            survives.chars().map(|c| c.to_digit(10).unwrap() as u8).collect()
        );
    }

    pub fn clear_universe(&mut self) -> () {
        self.cells = (0..self.wdim * self.hdim).map(|_i| Cell::Dead).collect();
    }

    pub fn cell_form_factor(&self) -> CellFormFactor { self.cell_form_factor }
    pub fn set_cell_form_factor(&mut self, cell_form_factor: CellFormFactor) -> () {
        self.cell_form_factor = cell_form_factor;
    }

    fn get_index(&self, w: u32, h: u32) -> usize {
        (w + h * self.wdim) as usize
    }

    fn live_neighbour_count(&self, w: u32, h: u32) -> u8 {
        match self.cell_form_factor {
            CellFormFactor::Square => self.live_neighbour_count_square(w, h),
            CellFormFactor::Triangle => self.live_neighbour_count_triangle(w, h),
            CellFormFactor::Hexagon => self.live_neighbour_count_hexagon(w, h)
        }
    }

    fn live_neighbour_count_square(&self, w: u32, h: u32) -> u8 {
        let mut count = 0;
        
        for dw in [self.wdim - 1, 0, 1].iter().cloned() {
            for dh in [self.hdim - 1, 0, 1].iter().cloned() {
                if dw == 0 && dh == 0 {
                    continue;
                }

                let nh = (h + dh) % self.hdim;
                let nw = (w + dw) % self.wdim;
                let idx = self.get_index(nw, nh);
                count += self.cells[idx] as u8;
            }
        }

        count
    }

    fn live_neighbour_count_triangle(&self, w: u32, h: u32) -> u8 {
        let mut count = 0;

        let neighbour_columns = [self.hdim - 1, 0, 1];
        let mut neighbour_rows = [vec![self.wdim - 1, 0, 1], vec![self.wdim - 2, self.wdim - 1, 1, 2], vec![self.wdim - 2, self.wdim - 1, 0, 1, 2]];
        if (w % 2 == 0 && h % 2 == 0) || (w % 2 == 1 && h % 2 == 1) {
            neighbour_rows.reverse()
        }

        let neighbours: Vec<_> = neighbour_columns.iter().zip(neighbour_rows.iter()).collect();

        for (dh, w_row) in neighbours.iter().cloned() {
            for dw in w_row.iter().cloned() {
                let nh = (h + dh) % self.hdim;
                let nw = (w + dw) % self.wdim;
                let idx = self.get_index(nw, nh);
                count += self.cells[idx] as u8;
            }
        }

        count
    }

    fn live_neighbour_count_hexagon(&self, w: u32, h: u32) -> u8 {
        let mut count = 0;

        let neighbour_columns = [self.hdim - 1, 0, 1];

        let twomplus_neighbour_rows = [vec![self.wdim - 1, 0], vec![self.wdim - 1, 1], vec![self.wdim - 1, 0]];
        let twom_neighbour_rows = [vec![0, 1], vec![self.wdim - 1, 1], vec![0, 1]];
        let neigbour_rows = match h % 2 == 0 { true => twom_neighbour_rows, false => twomplus_neighbour_rows };

        let neighbours: Vec<_> = neighbour_columns.iter().zip(neigbour_rows.iter()).collect();

        for (dh, w_row) in neighbours.iter().cloned() {
            for dw in w_row.iter().cloned() {
                let nh = (h + dh) % self.hdim;
                let nw = (w + dw) % self.wdim;
                let idx = self.get_index(nw, nh);
                count += self.cells[idx] as u8;
            }
        }

        count
    }
}

impl Universe {
    pub fn get_cells(&self) -> &[Cell] { &self.cells }

    pub fn set_cells(&mut self, cells: &[(u32, u32)]) -> () {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_index(row, col);
            self.cells[idx] = Cell::Alive;
        }
    }
}

impl std::fmt::Display for Universe {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        for line in self.cells.as_slice().chunks(self.wdim as usize) {
            for &cell in line {
                let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }

        Ok(())
    }
}