const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "immune",
  password: "postgres",
  port: 5432,
});

const getSearchResults = async (body) => {
  try {
    const { searchText } = body;
    const result = await Promise.all([
      pool.query(
      'SELECT * FROM "01_xbyct" WHERE "cell synoym" like $1::text',
      [`%${searchText.trim()}%`]
    ),
    pool.query('SELECT * FROM "03_mybxyct" WHERE "immunophenotype synonym" like $1::text',
      [`%${searchText.trim()}%`]
    ),
  ]);
    return { data: { cells: result[0].rows, immunophenotypes: result[1].rows } };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getAssociatedImmunophenotypes = async (body) => {
  try {
    const { searchText } = body;
    const [cell, immunophenotypes] = await Promise.all([
      pool.query('SELECT * FROM "01_xbyct" WHERE "cell id" = $1::text', [
        `${searchText.trim()}`,
      ]),
      pool.query('SELECT * FROM "02_xbbhdmybx" WHERE "cell id" = $1::text', [
        `${searchText.trim()}`,
      ]),
    ]);
    return {
      data: { cell: cell.rows[0], immunophenotypes: immunophenotypes.rows },
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getRelations = async (body) => {
  try {
    const { searchText } = body;
    const params = [`${searchText.trim()}`]
    const [immunophenotype, r1, r2, r3, r4, r5] = await Promise.all([
      pool.query(
        'SELECT * FROM "03_mybxyct" WHERE "immunophenotype id" = $1::text',
        params
      ),
      pool.query(
        'SELECT * FROM "04_mybxysnps" WHERE "immunophenotype id" = $1::text',
        params
      ),
      pool.query(
        'SELECT B.* FROM (SELECT * FROM "04_mybxysnps" WHERE "immunophenotype id" = $1::text) A JOIN "05_snpsyjb" B ON A."strongest snp-risk allele" = B."strongest snp-risk allele"',
        params
      ),
      pool.query(
        'SELECT B.* FROM (SELECT * FROM "04_mybxysnps" WHERE "immunophenotype id" = $1::text) A JOIN "06_mybxyjb" B ON A."immunophenotype name" = B."immunophenotype name"',
        params
      ),
      pool.query(
        'SELECT B.* FROM (SELECT * FROM "04_mybxysnps" WHERE "immunophenotype id" = $1::text) A JOIN "07_jyysnps" B ON A."strongest snp-risk allele" = B."strongest snp-risk allele"',
        params
      ),
      pool.query(
        'SELECT B.* FROM (SELECT * FROM "04_mybxysnps" WHERE "immunophenotype id" = $1::text) A JOIN "08_jyyjb" B ON A."mapped_gene" = B."mapped_gene"',
        params
      )
    ]);
    return {
      data: { immunophenotype: immunophenotype.rows[0], relations: [r1.rows, r2.rows, r3.rows, r4.rows, r5.rows] },
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getImmunophenotypesVersusSNPs = async (body) => {
  try {
    const { id } = body;
    const [immunophenotype, SNPs] = await Promise.all([
      pool.query(
        'SELECT * FROM "03_mybxyct" WHERE "immunophenotype id" = $1::text',
        [`${id.trim()}`]
      ),
      pool.query(
        'SELECT * FROM "04_mybxysnps" WHERE "immunophenotype id" = $1::text',
        [`${id.trim()}`]
      ),
    ]);
    return {
      data: { immunophenotype: immunophenotype.rows[0], SNPs: SNPs.rows },
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getSNPsVersusDiseases = async (body) => {
  try {
    const { id } = body;
    const result = await pool.query(
      'SELECT * FROM "05_snpsyjb" WHERE "strongest snp-risk allele" = $1::text',
      [`${id.trim()}`]
    );
    return { data: result.rows };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  getSearchResults,
  getAssociatedImmunophenotypes,
  getRelations,
  getImmunophenotypesVersusSNPs,
  getSNPsVersusDiseases,
};
