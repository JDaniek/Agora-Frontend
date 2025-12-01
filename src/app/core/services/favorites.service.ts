import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable, map} from 'rxjs';

// 👇 Importamos la card que ya usas en todo el módulo
import {AdviserCardResponse} from './adviser.service';

/**
 * Lo que devuelve el backend en /favorites/teachers
 * (coincide con AdviserCardResponse del backend, pero le ponemos nombre propio)
 */
interface FavoriteTeacherResponse {
  userId: number;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  level: string | null;
  description: string | null;
  specialties: string[];
  stateCode?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  /**
   * GET /api/v1/favorites/teachers
   * Devuelve datos ya adaptados a AdviserCardResponse
   */
  getMyFavoriteTeachers(): Observable<AdviserCardResponse[]> {
    const url = `${this.apiUrl}/favorites/teachers`;

    return this.http.get<FavoriteTeacherResponse[]>(url).pipe(
      map(response =>
        response.map(dto => {
          const fullName = `${dto.firstName} ${dto.lastName}`.trim();

          const card: AdviserCardResponse = {
            userId: dto.userId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            photoUrl: dto.photoUrl,
            level: dto.level,
            description: dto.description,
            specialties: dto.specialties ?? [],
            stateCode: dto.stateCode ?? null
          };

          return card;
        })
      )
    );
  }

  /**
   * POST /api/v1/favorites/teachers/{teacherId}
   */
  addFavorite(teacherId: number): Observable<void> {
    const url = `${this.apiUrl}/favorites/teachers/${teacherId}`;
    return this.http.post<void>(url, {});
  }

  /**
   * DELETE /api/v1/favorites/teachers/{teacherId}
   */
  removeFavorite(teacherId: number): Observable<void> {
    const url = `${this.apiUrl}/favorites/teachers/${teacherId}`;
    return this.http.delete<void>(url);
  }
}
