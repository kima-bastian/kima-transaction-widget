export declare const fetchWrapper: {
    get: typeof get;
    post: typeof post;
};
declare function get(url: string): Promise<string>;
declare function post(url: string, body: any): Promise<string>;
export {};
