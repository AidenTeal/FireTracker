export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Convert degrees to radians
    const toRadians = (degree) => degree * (Math.PI / 180);

    // Convert input values to radians
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    // Calculate the components of the formula
    const sinLat1 = Math.sin(lat1Rad);
    const sinLat2 = Math.sin(lat2Rad);
    const cosLat1 = Math.cos(lat1Rad);
    const cosLat2 = Math.cos(lat2Rad);
    const cosLonDiff = Math.cos(lon2Rad - lon1Rad);

    // Calculate the acos argument
    const acosArg = sinLat1 * sinLat2 + cosLat1 * cosLat2 * cosLonDiff;

    // Ensure the argument for acos is within the range [-1, 1]
    if (acosArg < -1 || acosArg > 1) {
        console.error('acosArg is out of range: ', acosArg);
        return NaN;
    }
    // Calculate the distance
    const distance = Math.acos(acosArg) * 6371;

    return distance;
}