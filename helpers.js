// expand(3, 2) returns "($1, $2), ($3, $4), ($5, $6)"
function expand(rowCount, columnCount, startAt=1){
    let index = startAt
    return Array(rowCount).fill(0).map(() => `(${Array(columnCount).fill(0).map(() => `$${index++}`).join(", ")})`).join(", ")
}

// flatten([[1, 2], [3, 4]]) returns [1, 2, 3, 4]
function flatten(arr){
    const newArr = []
    arr.forEach(v => v.forEach(p => newArr.push(p)))
    return newArr
}

module.exports = {
    expand,
    flatten
}
