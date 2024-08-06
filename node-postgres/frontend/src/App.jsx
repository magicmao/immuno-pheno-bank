import { useState, useMemo, useEffect } from "react";

const PageState = Object.freeze({
  NONE: "",
  SEARCH_RESULT: "search_result",
  SELECT_IMMUNOPHENOTYPE: "select_immunophenotype",
  SHOW_RELATIONS: "show_relations",
});

// export const SearchFlag = Object.freeze({
//   NONE: "",
//   CELLS: "cells", // 搜索 -> （细胞）
//   IMMUNOPHENOTYPES: "immunophenotypes", // 搜索 -> （表型）
//   RELATIONS: "cells_to_immunophenotypes", // 搜索 -> （表型:Summary、表型-SNP、SNP-疾病、表型-疾病、基因-SNP、基因-疾病）
// });

export default function App() {
  // const [_, setMerchants] = useState(false);
  const [currentPage, setCurrentPage] = useState(PageState.NONE);
  const [searchText, setSearchText] = useState("alpha-beta");
  const [resultCells, setResultCells] = useState([]);
  const [resultCellToImmunoPhenoTypes, setResultCellToImmunoPhenoTypes] =
    useState({
      cell: {},
      immunophenotypes: [],
    });
  const [resultImmunoPhenoTypes, setResultImmunoPhenoTypes] = useState([]);

  const [
    resultRelations,
    setResultRelations,
  ] = useState({
    immunophenotype: {},
    relations: [],
  });

  // useEffect(()=>{
  //   switch(currentPage){
  //     case PageState.SEARCH_RESULT:
  //       search([SearchFlag.CELLS, SearchFlag.IMMUNOPHENOTYPES], searchText)
  //       .then((result) => {
  //         const data = JSON.parse(result).data;
  //         console.log(data);
  //         const [cells, immunophenotypes] = data;
  //         setResultCells(cells);
  //         setResultImmunoPhenoTypes(immunophenotypes);
  //       });
  //       break;
  //     case PageState.SELECT_IMMUNOPHENOTYPE:
  //       search(SearchFlag.CELLS_TO_IMMUNOPHENOTYPES, "CL_0000675");
  //       break;
  //   }

  // }, [currentPage]);

  const searchApi = (page, searchText) =>{
    return fetch("http://localhost:3001/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ page, searchText }),
    })
      .then((response) => {
        return response.text();
      });
  }

  const search = (page, id = "") => {
    setCurrentPage(page);
    switch (page) {
      case PageState.SEARCH_RESULT:
        searchApi(page, searchText)
          .then((result) => {
            const data = JSON.parse(result).data;
            console.log(data);
            const {cells, immunophenotypes} = data;
            setResultCells(cells);
            setResultImmunoPhenoTypes(immunophenotypes);
          });
        break;
      case PageState.SELECT_IMMUNOPHENOTYPE:
        searchApi(page, id)
          .then((result) => {
            const data = JSON.parse(result).data;
            console.log(data);
            const { cell, immunophenotypes } = data;
            setResultCellToImmunoPhenoTypes({ cell, immunophenotypes });
          });
        break;
      case PageState.SHOW_RELATIONS:
        searchApi(page, id)
          .then((result) => {
            const data = JSON.parse(result).data;
            console.log(data);
            const { immunophenotype, relations } = data;
            setResultRelations({ immunophenotype, relations });
          });
        break;
        // case SearchFlag.IMMUNOPHENOTYPES_TO_SNP:
        //   fetch("http://localhost:3001/search", {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ type, id }),
        //   })
        //     .then((response) => {
        //       return response.text();
        //     })
        //     .then((result) => {
        //       const data = JSON.parse(result).data;
        //       console.log(data);
        //       // const { cell, immunophenotypes } = data;
        //       setResultImmunophenotypesVersusSNPs(data);
        //     });
        //   break;
      default:
        break;
    }
  };

  // function getMerchant() {
  //   fetch("http://localhost:3001")
  //     .then((response) => {
  //       return response.text();
  //     })
  //     .then((data) => {
  //       setMerchants(data);
  //     });
  // }

  const renderCells = useMemo(() => {
    if (resultCells.length == 0) return <div>Found Nothing in Cells</div>;
    const keys = ["cell id", "cell name", "cell definition", "cell synoym"];
    const content = resultCells.map((row, idx) => (
      <tr
        key={`row_${idx}`}
        onClick={() =>
          search(PageState.SELECT_IMMUNOPHENOTYPE, row["cell id"])
        }
      >
        {keys.map((key, idx) => (
          <td key={`cell_${idx}`}>{row[key]}</td>
        ))}
      </tr>
    ));
    return (
      <table style={{ width: "100%" }} className="clickable">
        <caption>
          <h2>Found Cells</h2>
        </caption>
        <thead>
          <tr>
            {keys.map((key, idx) => (
              <th key={`hcell_${idx}`}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>{content}</tbody>
      </table>
    );
  }, [resultCells]);

  const renderImmunoPhenoTypes = useMemo(() => {
    if (resultImmunoPhenoTypes.length == 0)
      return <div>Found Nothing in ImmunoPhenoTypes</div>;
    const keys = [
      "immunophenotype id",
      "immunophenotype name",
      "immunophenotype detection item",
      "immunophenotype definition",
      "immunophenotype synonym",
    ];
    const content = resultImmunoPhenoTypes.map((row, idx) => (
      <tr
        key={`row_${idx}`}
        onClick={() =>
          search(
            PageState.SHOW_RELATIONS,
            row["immunophenotype id"]
          )
        }
      >
        {keys.map((key, idx) => (
          <td key={`immunophenotype_${idx}`}>{row[key]}</td>
        ))}
      </tr>
    ));
    return (
      <table style={{ width: "100%" }} className="clickable">
        <caption>
          <h2>Found ImmunoPhenoTypes</h2>
        </caption>
        <thead>
          <tr>
            {keys.map((key, idx) => (
              <th key={`himmunophenotype_${idx}`}>{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>{content}</tbody>
      </table>
    );
  }, [resultImmunoPhenoTypes]);

  const renderCellToImmunoPhenoTypes = useMemo(() => {
    const { cell, immunophenotypes } = resultCellToImmunoPhenoTypes;
    if (immunophenotypes.length == 0)
      return <div>Found Nothing in immunophenotypes</div>;
    const keys = [
      "immunophenotype id",
      "immunophenotype name",
      "immunophenotype detection item",
    ];
    const content = immunophenotypes.map((row, idx) => (
      <tr
        key={`row_${idx}`}
        onClick={() =>
          search(
            PageState.SHOW_RELATIONS,
            row["immunophenotype id"]
          )
        }
      >
        {keys.map((key, idx) => (
          <td key={`cell_${idx}`}>{row[key]}</td>
        ))}
      </tr>
    ));
    return (
      <>
        <table style={{ width: "100%" }} className="clickable">
          <caption>
            <h2>Summary</h2>
          </caption>
          <tbody>
            <tr>
              <td>
                <b>Name: </b>
                {cell["cell name"]}
                <br />
                <b>ID: </b>
                {cell["cell id"]}
                <br />
                <b>Definition: </b>
                {cell["cell definition"]}
                <br />
                <b>Synonym: </b>
                {cell["cell synoym"]}
                <br />
              </td>
            </tr>
          </tbody>
        </table>
        <table style={{ width: "100%" }} className="clickable">
          <caption>
            <h2>Associated immunophenotypes</h2>
          </caption>
          <thead>
            <tr>
              {keys.map((key, idx) => (
                <th key={`cell_${idx}`}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>{content}</tbody>
        </table>
      </>
    );
  }, [resultCellToImmunoPhenoTypes]);

  const genTable = (caption, keys, rows) =>{
    if (!rows || rows.length == 0) return <div>Found Nothing in {caption}</div>;
    const content = rows.map((row, idx) => (
      <tr key={`row_${caption}_${idx}`}>
        {keys.map((key, idx) => (
          <td key={`cell_${idx}`}>{row[key]}</td>
        ))}
      </tr>
    ));
    return <table style={{ width: "100%" }} className="clickable">
    <caption>
      <h2>{caption}</h2>
    </caption>
    <thead>
      <tr>
        {keys.map((key, idx) => (
          <th key={`cell_${caption}_${idx}`}>{key}</th>
        ))}
      </tr>
    </thead>
    <tbody>{content}</tbody>
  </table>
  }

  const renderRelations = useMemo(()=>{
    const { immunophenotype, relations } = resultRelations;
    const [r1, r2, r3, r4, r5] = relations;
    console.log({r1, r2, r3, r4, r5})
    // if (immunophenotypes.length == 0)
    //   return <div>Found Nothing in immunophenotypes</div>;
    const contents = [];
    contents.push(genTable("Immunophenotypes versus SNPs",
      ["immunophenotype id","immunophenotype name","strongest snp-risk allele","p-value",
"risk allele frequency","or or beta","95% ci (text)","mapped_gene","chr_i d",
"chr_pos"], r1));
    contents.push(genTable("SNPs versus Diseases", 
      ["strongest snp-risk allele","disease","p-value","risk allele frequency",
"or or beta","95% ci (text)","mapped_gene","chr_id",
"chr_pos"], r2));
    contents.push(genTable("Immunophenotypes versus Diseases", 
      ["immunophenotype name","disease","omim disease",
"omim disease number"], r3));
    contents.push(genTable("Genes versus SNPs",
       ["mapped_gene","strongest snp-risk allele"], r4));
    contents.push(genTable("Genes versus Diseases",
       ["mapped_gene","disease","omim disease","omim disease number"], r5));
    // const content = immunophenotypes.map((row, idx) => (
    //   <tr
    //     key={`row_${idx}`}
    //     onClick={() =>
    //       search(
    //         PageState.SHOW_RELATIONS,
    //         row["immunophenotype id"]
    //       )
    //     }
    //   >
    //     {keys.map((key, idx) => (
    //       <td key={`cell_${idx}`}>{row[key]}</td>
    //     ))}
    //   </tr>
    // ));
    return (
      <>
        <table style={{ width: "100%" }} className="clickable">
          <caption>
            <h2>Summary</h2>
          </caption>
          <tbody>
            <tr>
              <td>
                <b>Name: </b>
                {immunophenotype["immunophenotype name"]}
                <br />
                <b>ID: </b>
                {immunophenotype["immunophenotype id"]}
                <br />
                <b>Detection item: </b>
                {immunophenotype["immunophenotype  detection item"]}
                <b>Definition: </b>
                {immunophenotype["immunophenotype definition"]}
                <br />
                <b>Synonym: </b>
                {immunophenotype["immunophenotype synonym"]}
                <br />
              </td>
            </tr>
          </tbody>
        </table>
        {contents}
        {/* <table style={{ width: "100%" }} className="clickable">
          <caption>
            <h2>Associated immunophenotypes</h2>
          </caption>
          <thead>
            <tr>
              {keys.map((key, idx) => (
                <th key={`cell_${idx}`}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>{content}</tbody>
        </table> */}
      </>
    );
  }, [resultRelations])

  // const renderImmunophenotypesVersusSNPs = useMemo(() => {
  //   const { immunophenotype, SNPs } = resultImmunophenotypesVersusSNPs;
  //   if (SNPs.length == 0)
  //     return <div>Found Nothing in immunophenotypesVersusSNPs</div>;
  //   const keys = [
  //     "immunophenotype id",
  //     "immunophenotype name",
  //     "immunophenotype detection item",
  //     "strongest snp-risk allele",
  //     "p-value",
  //     "risk allele frequency",
  //     "or or beta",
  //     "95% ci (text)",
  //     "mapped_gene",
  //     "chr_id",
  //     "chr_pos",
  //   ];
  //   const content = SNPs.map((row, idx) => (
  //     <tr key={`row_${idx}`}>
  //       {keys.map((key, idx) => (
  //         <td key={`cell_${idx}`}>{row[key]}</td>
  //       ))}
  //     </tr>
  //   ));
  //   return (
  //     <>
  //       <table style={{ width: "100%" }} className="clickable">
  //         <caption>
  //           <h2>Summary</h2>
  //         </caption>
  //         <tbody>
  //           <tr>
  //             <td>
  //               <b>Name: </b>
  //               {immunophenotype["immunophenotype name"]}
  //               <br />
  //               <b>ID: </b>
  //               {immunophenotype["immunophenotype id"]}
  //               <br />
  //               <b>Detection item: </b>
  //               {immunophenotype["immunophenotype detection item"]}
  //               <br />
  //               <b>Definition: </b>
  //               {immunophenotype["immunophenotype definition"]}
  //               <br />
  //               <b>Synonym: </b>
  //               {immunophenotype["immunophenotype synonym"]}
  //               <br />
  //             </td>
  //           </tr>
  //         </tbody>
  //       </table>
  //       <table style={{ width: "100%" }} className="clickable">
  //         <caption>
  //           <h2>Immunophenotypes versus SNPs</h2>
  //         </caption>
  //         <thead>
  //           <tr>
  //             {keys.map((key, idx) => (
  //               <th key={`cell_${idx}`}>{key}</th>
  //             ))}
  //           </tr>
  //         </thead>
  //         <tbody>{content}</tbody>
  //       </table>
  //     </>
  //   );
  // }, [resultImmunophenotypesVersusSNPs]);

  // const renderSNPsVersusDiseases = useMemo(() => {
  //   if (resultSNPsVersusDiseases.length == 0) return <div>Found Nothing</div>;
  //   const keys = [
  //     "strongest snp-risk allele",
  //     "disease",
  //     "p-value",
  //     "risk allele frequency",
  //     "or or beta",
  //     "95% ci (text)",
  //     "mapped_gene",
  //     "chr_id",
  //     "chr_pos",
  //   ];
  //   console.log({ resultSNPsVersusDiseases });
  //   const content = resultSNPsVersusDiseases.map((row, idx) => (
  //     <tr
  //       key={`row_${idx}`}
  //       onClick={() =>
  //         search(SearchFlag.IMMUNOPHENOTYPES_DISEASES, row["cell id"])
  //       }
  //     >
  //       {keys.map((key, idx) => (
  //         <td key={`cell_${idx}`}>{row[key]}</td>
  //       ))}
  //     </tr>
  //   ));
  //   return (
  //     <table style={{ width: "100%" }} className="clickable">
  //       <thead>
  //         <tr>
  //           {keys.map((key, idx) => (
  //             <th key={`cell_${idx}`}>{key}</th>
  //           ))}
  //         </tr>
  //       </thead>
  //       <tbody>{content}</tbody>
  //     </table>
  //   );
  // }, [resultSNPsVersusDiseases]);

  useEffect(() => {
    // getMerchant();
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        flexDirection: "column",
        gap: "10px",
        left: 10,
        top: 10,
        right: 10,
        bottom: 10,
      }}
    >
      <div
        style={{
          alignSelf: "center",
          border: "1px solid black",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "center",
          marginBottom: "10px",
        }}
      >
        <h1 style={{ textAlign: "center" }}>Immunophenobank</h1>
      </div>
      <div style={{ height: "500px", overflow: "auto" }}>
        {currentPage == PageState.NONE && (
          <div
            style={{
              alignSelf: "center",
              border: "1px solid black",
              alignItems: "start",
              flexDirection: "column",
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>Quick search</h2>
            <table style={{ verticalAlign: "middle" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle", width: "100%" }}>
                    <input
                      value={searchText}
                      style={{ width: "100%" }}
                      type="text"
                      placeholder="Search by merchant name"
                      onChange={(e) => setSearchText(e.target.value)}
                    ></input>
                  </td>
                  <td>
                    <button
                      onClick={() =>search(PageState.SEARCH_RESULT)}
                    >
                      Search
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* {merchants ? merchants : "There is no merchant data available"} */}
        {currentPage == PageState.SEARCH_RESULT && renderCells}
        {currentPage == PageState.SEARCH_RESULT && renderImmunoPhenoTypes}

        {currentPage == PageState.SELECT_IMMUNOPHENOTYPE && renderCellToImmunoPhenoTypes}

        {currentPage == PageState.SHOW_RELATIONS && renderRelations}

        {/* {searchStage == SearchFlag.IMMUNOPHENOTYPES_TO_SNP &&
          renderImmunophenotypesVersusSNPs}

        {searchStage == SearchFlag.IMMUNOPHENOTYPES_SNP &&
          renderSNPsVersusDiseases} */}
        {/* <br />
          <button onClick={createMerchant}>Add merchant</button>
          <br />
          <button onClick={deleteMerchant}>Delete merchant</button>
          <br />
          <button onClick={updateMerchant}>Update merchant</button> */}
      </div>
    </div>
  );
}
