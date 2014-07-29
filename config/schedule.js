module.exports = {
    once : {
        type : "oneTime",
        frequency : undefined
    },
    weekly : {
        type : "recurring",
        frequency : 7
    },
    biweekly : {
        type : "recurring",
        frequency : 14
    },
    monthly : {
        type : "recurring",
        frequency : 30
    },
    trimonthly : {
        type : "recurring",
        frequency : 90
    },
    sixmonthly : {
        type : "recurring",
        frequency : 180
    },
    annually : {
        type : "recurring",
        frequency : 365
    }
}