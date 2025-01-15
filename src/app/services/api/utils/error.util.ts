export class ErrorUtil {
  static handleSupabaseError(error: any, context: string): never {
    console.error(`Error in ${context}:`, error);
    throw error;
  }
}
