import { Request, Response } from "express";
import { validationResult } from "express-validator";


export function createNewUser (req:Request, res:Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
    return;
  }
  try {
        
  } catch (error) {
    
  }
}