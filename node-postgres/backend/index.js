const express = require("express");
const app = express();
const port = 3001;

const merchant_model = require("./merchantModel");
const xbyct_model = require("./01_xbyctModel");


const PageState = Object.freeze({
  NONE: "",
  SEARCH_RESULT: "search_result",
  SELECT_IMMUNOPHENOTYPE: "select_immunophenotype",
  SHOW_RELATIONS: "show_relations",
});

const SearchFlag = Object.freeze({
  NONE: "",
  CELLS: "cells", // 搜索 -> （细胞）
  IMMUNOPHENOTYPES: "immunophenotypes", // 搜索 -> （表型）
  RELATIONS: "cells_to_immunophenotypes", // 搜索 -> （表型:Summary、表型-SNP、SNP-疾病、表型-疾病、基因-SNP、基因-疾病）
});

app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers"
  );
  next();
});

app.get("/", (req, res) => {
  merchant_model
    .getItems()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post("/search", (req, res) => {
  const { page } = req.body;
  switch (page) {
    case PageState.SEARCH_RESULT:
      return xbyct_model
        .getSearchResults(req.body)
        .then((response) => {
          res.status(200).send(response);
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    case PageState.SELECT_IMMUNOPHENOTYPE:
      return xbyct_model
        .getAssociatedImmunophenotypes(req.body)
        .then((response) => {
          res.status(200).send(response);
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    case PageState.SHOW_RELATIONS: 
        return xbyct_model
        .getRelations(req.body)
        .then((response) => {
          res.status(200).send(response);
        })
        .catch((error) => {
          res.status(500).send(error);
        });
    // case 3: // Immunophenotypes versus SNPs
    //   return xbyct_model
    //     .getImmunophenotypesVersusSNPs(req.body)
    //     .then((response) => {
    //       res.status(200).send(response);
    //     })
    //     .catch((error) => {
    //       res.status(500).send(error);
    //     });
    // case 4: // SNPs versus Diseases
    //   return xbyct_model
    //     .getSNPsVersusDiseases(req.body)
    //     .then((response) => {
    //       res.status(200).send(response);
    //     })
    //     .catch((error) => {
    //       res.status(500).send(error);
    //     });
    default:
      return {};
  }
});
// app.post('/merchants', (req, res) => {
//   merchant_model.createMerchant(req.body)
//   .then(response => {
//     res.status(200).send(response);
//   })
//   .catch(error => {
//     res.status(500).send(error);
//   })
// })

// app.delete('/merchants/:id', (req, res) => {
//   merchant_model.deleteMerchant(req.params.id)
//   .then(response => {
//     res.status(200).send(response);
//   })
//   .catch(error => {
//     res.status(500).send(error);
//   })
// })
// app.put("/merchants/:id", (req, res) => {
//   const id = req.params.id;
//   const body = req.body;
//   merchant_model
//     .updateMerchant(id, body)
//     .then((response) => {
//       res.status(200).send(response);
//     })
//     .catch((error) => {
//       res.status(500).send(error);
//     });
// });

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
