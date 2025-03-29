import { APIResource } from "../resource.js";
import * as Core from "../core.js";
export declare class Models extends APIResource {
    /**
     * Lists all of Together's open-source models
     */
    list(options?: Core.RequestOptions): Core.APIPromise<ModelListResponse>;
}
export type ModelListResponse = Array<ModelListResponse.ModelListResponseItem>;
export declare namespace ModelListResponse {
    interface ModelListResponseItem {
        id: string;
        created: number;
        object: string;
        type: 'chat' | 'language' | 'code' | 'image' | 'embedding' | 'moderation' | 'rerank';
        context_length?: number;
        display_name?: string;
        license?: string;
        link?: string;
        organization?: string;
        pricing?: ModelListResponseItem.Pricing;
    }
    namespace ModelListResponseItem {
        interface Pricing {
            base: number;
            finetune: number;
            hourly: number;
            input: number;
            output: number;
        }
    }
}
export declare namespace Models {
    export { type ModelListResponse as ModelListResponse };
}
//# sourceMappingURL=models.d.ts.map