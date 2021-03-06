import { Contract } from "../../parser/abiParser";
import { TsGeneratorPlugin, TContext, TFileDesc } from "ts-generator";
import { join } from "path";
import { extractAbi, parse } from "../../parser/abiParser";
import { getFilename } from "../shared";
import { codegen } from "./generation";

export interface IEthersCfg {
  outDir?: string;
}

const DEFAULT_OUT_PATH = "./types/ethers-contracts/";

export class Ethers extends TsGeneratorPlugin {
  name = "Ethers";

  private readonly outDirAbs: string;

  constructor(ctx: TContext<IEthersCfg>) {
    super(ctx);

    const { cwd, rawConfig } = ctx;

    this.outDirAbs = join(cwd, rawConfig.outDir || DEFAULT_OUT_PATH);
  }

  transformFile(file: TFileDesc): TFileDesc | void {
    const abi = extractAbi(file.contents);
    const isEmptyAbi = abi.length === 0;
    if (isEmptyAbi) {
      return;
    }

    const name = getFilename(file.path);

    const contract = parse(abi, name);

    return {
      path: join(this.outDirAbs, `${name}.d.ts`),
      contents: codegen(contract),
    };
  }
}
