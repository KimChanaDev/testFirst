export function RandomArrayElement<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}