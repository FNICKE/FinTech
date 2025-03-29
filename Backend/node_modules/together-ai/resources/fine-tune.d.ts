import { APIResource } from "../resource.js";
import * as Core from "../core.js";
export declare class FineTuneResource extends APIResource {
    /**
     * Use a model to create a fine-tuning job.
     */
    create(body: FineTuneCreateParams, options?: Core.RequestOptions): Core.APIPromise<FineTune>;
    /**
     * List the metadata for a single fine-tuning job.
     */
    retrieve(id: string, options?: Core.RequestOptions): Core.APIPromise<FineTune>;
    /**
     * List the metadata for all fine-tuning jobs.
     */
    list(options?: Core.RequestOptions): Core.APIPromise<FineTuneListResponse>;
    /**
     * Cancel a currently running fine-tuning job.
     */
    cancel(id: string, options?: Core.RequestOptions): Core.APIPromise<FineTune>;
    /**
     * Download a compressed fine-tuned model or checkpoint to local disk.
     */
    download(query: FineTuneDownloadParams, options?: Core.RequestOptions): Core.APIPromise<FineTuneDownloadResponse>;
    /**
     * List the events for a single fine-tuning job.
     */
    listEvents(id: string, options?: Core.RequestOptions): Core.APIPromise<FineTuneEvent>;
}
export interface FineTune {
    id: string;
    status: 'pending' | 'queued' | 'running' | 'compressing' | 'uploading' | 'cancel_requested' | 'cancelled' | 'error' | 'completed';
    batch_size?: number;
    created_at?: string;
    epochs_completed?: number;
    eval_steps?: number;
    events?: Array<FineTune.Event>;
    job_id?: string;
    learning_rate?: number;
    lr_scheduler?: FineTune.LrScheduler;
    max_grad_norm?: number;
    model?: string;
    model_output_name?: string;
    model_output_path?: string;
    n_checkpoints?: number;
    n_epochs?: number;
    n_evals?: number;
    param_count?: number;
    queue_depth?: number;
    token_count?: number;
    total_price?: number;
    train_on_inputs?: boolean | 'auto';
    training_file?: string;
    training_type?: FineTune.FullTrainingType | FineTune.LoRaTrainingType;
    trainingfile_numlines?: number;
    trainingfile_size?: number;
    updated_at?: string;
    validation_file?: string;
    wandb_project_name?: string;
    wandb_url?: string;
    warmup_ratio?: number;
    weight_decay?: number;
}
export declare namespace FineTune {
    interface Event {
        created_at?: string;
        hash?: string;
        level?: 'info' | 'warning' | 'error' | 'legacy_info' | 'legacy_iwarning' | 'legacy_ierror' | null;
        message?: string;
        object?: 'FinetuneEvent';
        param_count?: number;
        token_count?: number;
        type?: 'job_pending' | 'job_start' | 'job_stopped' | 'model_downloading' | 'model_download_complete' | 'training_data_downloading' | 'training_data_download_complete' | 'validation_data_downloading' | 'validation_data_download_complete' | 'wandb_init' | 'training_start' | 'checkpoint_save' | 'billing_limit' | 'epoch_complete' | 'training_complete' | 'model_compressing' | 'model_compression_complete' | 'model_uploading' | 'model_upload_complete' | 'job_complete' | 'job_error' | 'cancel_requested' | 'job_restarted' | 'refund' | 'warning';
        wandb_url?: string;
    }
    interface LrScheduler {
        lr_scheduler_type: string;
        lr_scheduler_args?: LrScheduler.LrSchedulerArgs;
    }
    namespace LrScheduler {
        interface LrSchedulerArgs {
            /**
             * The ratio of the final learning rate to the peak learning rate
             */
            min_lr_ratio?: number;
        }
    }
    interface FullTrainingType {
        type: 'Full';
    }
    interface LoRaTrainingType {
        lora_alpha: number;
        lora_r: number;
        type: 'Lora';
        lora_dropout?: number;
        lora_trainable_modules?: string;
    }
}
export interface FineTuneEvent {
    data: Array<FineTuneEvent.Data>;
}
export declare namespace FineTuneEvent {
    interface Data {
        checkpoint_path: string;
        created_at: string;
        hash: string;
        message: string;
        model_path: string;
        object: 'fine-tune-event';
        param_count: number;
        step: number;
        token_count: number;
        total_steps: number;
        training_offset: number;
        type: 'job_pending' | 'job_start' | 'job_stopped' | 'model_downloading' | 'model_download_complete' | 'training_data_downloading' | 'training_data_download_complete' | 'validation_data_downloading' | 'validation_data_download_complete' | 'wandb_init' | 'training_start' | 'checkpoint_save' | 'billing_limit' | 'epoch_complete' | 'training_complete' | 'model_compressing' | 'model_compression_complete' | 'model_uploading' | 'model_upload_complete' | 'job_complete' | 'job_error' | 'cancel_requested' | 'job_restarted' | 'refund' | 'warning';
        wandb_url: string;
        level?: 'info' | 'warning' | 'error' | 'legacy_info' | 'legacy_iwarning' | 'legacy_ierror' | null;
    }
}
export interface FineTuneListResponse {
    data: Array<FineTune>;
}
export interface FineTuneDownloadResponse {
    id?: string;
    checkpoint_step?: number;
    filename?: string;
    object?: unknown;
    size?: number;
}
export interface FineTuneCreateParams {
    /**
     * Name of the base model to run fine-tune job on
     */
    model: string;
    /**
     * File-ID of a training file uploaded to the Together API
     */
    training_file: string;
    /**
     * Batch size for fine-tuning
     */
    batch_size?: number;
    /**
     * Learning rate multiplier to use for training
     */
    learning_rate?: number;
    lr_scheduler?: FineTuneCreateParams.LrScheduler;
    /**
     * Max gradient norm to be used for gradient clipping. Set to 0 to disable.
     */
    max_grad_norm?: number;
    /**
     * Number of checkpoints to save during fine-tuning
     */
    n_checkpoints?: number;
    /**
     * Number of epochs for fine-tuning
     */
    n_epochs?: number;
    /**
     * Number of evaluations to be run on a given validation set during training
     */
    n_evals?: number;
    /**
     * Suffix that will be added to your fine-tuned model name
     */
    suffix?: string;
    /**
     * Whether to mask the user messages in conversational data or prompts in
     * instruction data.
     */
    train_on_inputs?: boolean | 'auto';
    training_type?: FineTuneCreateParams.FullTrainingType | FineTuneCreateParams.LoRaTrainingType;
    /**
     * File-ID of a validation file uploaded to the Together API
     */
    validation_file?: string;
    /**
     * API key for Weights & Biases integration
     */
    wandb_api_key?: string;
    /**
     * The base URL of a dedicated Weights & Biases instance.
     */
    wandb_base_url?: string;
    /**
     * The Weights & Biases name for your run.
     */
    wandb_name?: string;
    /**
     * The Weights & Biases project for your run. If not specified, will use `together`
     * as the project name.
     */
    wandb_project_name?: string;
    /**
     * The percent of steps at the start of training to linearly increase the learning
     * rate.
     */
    warmup_ratio?: number;
    /**
     * Weight decay
     */
    weight_decay?: number;
}
export declare namespace FineTuneCreateParams {
    interface LrScheduler {
        lr_scheduler_type: string;
        lr_scheduler_args?: LrScheduler.LrSchedulerArgs;
    }
    namespace LrScheduler {
        interface LrSchedulerArgs {
            /**
             * The ratio of the final learning rate to the peak learning rate
             */
            min_lr_ratio?: number;
        }
    }
    interface FullTrainingType {
        type: 'Full';
    }
    interface LoRaTrainingType {
        lora_alpha: number;
        lora_r: number;
        type: 'Lora';
        lora_dropout?: number;
        lora_trainable_modules?: string;
    }
}
export interface FineTuneDownloadParams {
    /**
     * Fine-tune ID to download. A string that starts with `ft-`.
     */
    ft_id: string;
    /**
     * Specifies checkpoint type to download - `merged` vs `adapter`. This field is
     * required if the checkpoint_step is not set.
     */
    checkpoint?: 'merged' | 'adapter';
    /**
     * Specifies step number for checkpoint to download. Ignores `checkpoint` value if
     * set.
     */
    checkpoint_step?: number;
    /**
     * Specifies output file name for downloaded model. Defaults to
     * `$PWD/{model_name}.{extension}`.
     */
    output?: string;
}
export declare namespace FineTuneResource {
    export { type FineTune as FineTune, type FineTuneEvent as FineTuneEvent, type FineTuneListResponse as FineTuneListResponse, type FineTuneDownloadResponse as FineTuneDownloadResponse, type FineTuneCreateParams as FineTuneCreateParams, type FineTuneDownloadParams as FineTuneDownloadParams, };
}
//# sourceMappingURL=fine-tune.d.ts.map